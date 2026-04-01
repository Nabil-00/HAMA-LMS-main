import { supabase } from '../supabaseClient';
import { Quiz, Question, QuizAttempt, QuizWithQuestions, Certificate, QuizStatus, QuestionStatus } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const quizService = {
  // Get quiz with questions for students (only approved questions)
  async getQuizWithQuestions(quizId: string): Promise<QuizWithQuestions | null> {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .eq('status', 'published')
      .single();

    if (quizError || !quiz) return null;

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, question_text, option_a, option_b, option_c, option_d, order_index')
      .eq('quiz_id', quizId)
      .eq('status', 'approved')
      .order('order_index', { ascending: true });

    if (questionsError) return null;

    return {
      id: quiz.id,
      courseId: quiz.course_id,
      title: quiz.title,
      passPercentage: quiz.pass_percentage,
      totalQuestions: quiz.total_questions,
      status: quiz.status,
      createdBy: quiz.created_by,
      createdAt: quiz.created_at,
      updatedAt: quiz.updated_at,
      questions: (questions || []).map((q: any) => ({
        id: q.id,
        quizId: quizId,
        questionText: q.question_text,
        optionA: q.option_a,
        optionB: q.option_b,
        optionC: q.option_c,
        optionD: q.option_d,
        correctOption: 'a' as const,
        status: 'approved' as QuestionStatus,
        generatedByAi: false,
        orderIndex: q.order_index
      }))
    };
  },

  // Submit quiz for scoring (server-side)
  async submitQuiz(quizId: string, answers: Record<string, string>): Promise<{
    success: boolean;
    score?: number;
    passed?: boolean;
    correctCount?: number;
    totalQuestions?: number;
    attemptId?: string;
    error?: string;
  }> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: 'Not authenticated' };

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/quiz-scoring`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': SUPABASE_ANON_KEY!
          },
          body: JSON.stringify({ quizId, answers })
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error('Quiz submission failed with status:', response.status);
        console.error('Response body:', text);
        try {
          return JSON.parse(text);
        } catch (e) {
          return { success: false, error: `Server error (${response.status}): ${text.substring(0, 100)}` };
        }
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Network error during quiz submission:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  },

  // Get user's quiz attempts
  async getUserAttempts(quizId: string): Promise<QuizAttempt[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('user_id', user.id)
      .order('attempted_at', { ascending: false });

    if (error) return [];

    return (data || []).map((a: any) => ({
      id: a.id,
      userId: a.user_id,
      quizId: a.quiz_id,
      score: a.score,
      passed: a.passed,
      answers: a.answers,
      attemptedAt: a.attempted_at
    }));
  },

  // Get user's certificate for a course
  async getUserCertificate(courseId: string): Promise<Certificate | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      courseId: data.course_id,
      issuedAt: data.issued_at,
      certificateUrl: data.certificate_url,
      uniqueCode: data.unique_code,
      quizAttemptId: data.quiz_attempt_id
    };
  },

  // Generate certificate
  async generateCertificate(courseId: string, quizAttemptId?: string): Promise<{
    success: boolean;
    certificateId?: string;
    uniqueCode?: string;
    htmlContent?: string;
    error?: string;
  }> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: 'Not authenticated' };

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: 'Not authenticated' };

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/generate-certificate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY!
        },
        body: JSON.stringify({ courseId, quizAttemptId })
      }
    );

    const result = await response.json();
    return result;
  }
};

// Admin functions
export const adminQuizService = {
  // Create a new quiz
  async createQuiz(courseId: string, title: string): Promise<Quiz | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        course_id: courseId,
        title: title,
        created_by: user.id,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating quiz:', error);
      return null;
    }

    return {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      passPercentage: data.pass_percentage,
      totalQuestions: data.total_questions,
      status: data.status,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Get all quizzes for a course (admin)
  async getCourseQuizzes(courseId: string): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) return [];

    return (data || []).map((q: any) => ({
      id: q.id,
      courseId: q.course_id,
      title: q.title,
      passPercentage: q.pass_percentage,
      totalQuestions: q.total_questions,
      status: q.status,
      createdBy: q.created_by,
      createdAt: q.created_at,
      updatedAt: q.updated_at
    }));
  },

  // Get all questions for a quiz (admin - includes correct answers)
  async getQuizQuestions(quizId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (error) return [];

    return (data || []).map((q: any) => ({
      id: q.id,
      quizId: q.quiz_id,
      questionText: q.question_text,
      optionA: q.option_a,
      optionB: q.option_b,
      optionC: q.option_c,
      optionD: q.option_d,
      correctOption: q.correct_option,
      explanation: q.explanation,
      status: q.status,
      generatedByAi: q.generated_by_ai,
      orderIndex: q.order_index
    }));
  },

  // Add/Update a question
  async saveQuestion(question: Partial<Question>): Promise<Question | null> {
    const { data, error } = await supabase
      .from('questions')
      .upsert({
        id: question.id,
        quiz_id: question.quizId,
        question_text: question.questionText,
        option_a: question.optionA,
        option_b: question.optionB,
        option_c: question.optionC,
        option_d: question.optionD,
        correct_option: question.correctOption,
        explanation: question.explanation,
        status: question.status || 'draft',
        generated_by_ai: question.generatedByAi || false,
        order_index: question.orderIndex || 0
      })
      .select()
      .single();

    if (error) return null;

    return {
      id: data.id,
      quizId: data.quiz_id,
      questionText: data.question_text,
      optionA: data.option_a,
      optionB: data.option_b,
      optionC: data.option_c,
      optionD: data.option_d,
      correctOption: data.correct_option,
      explanation: data.explanation,
      status: data.status,
      generatedByAi: data.generated_by_ai,
      orderIndex: data.order_index
    };
  },

  // Update question status (approve/reject)
  async updateQuestionStatus(questionId: string, status: QuestionStatus): Promise<boolean> {
    const { error } = await supabase
      .from('questions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', questionId);

    return !error;
  },

  // Publish quiz (only if 20 approved questions)
  async publishQuiz(quizId: string): Promise<{ success: boolean; error?: string }> {
    const { data: questions, error: countError } = await supabase
      .from('questions')
      .select('id')
      .eq('quiz_id', quizId)
      .eq('status', 'approved');

    if (countError) return { success: false, error: 'Failed to count questions' };

    if ((questions?.length || 0) < 5) {
      return { success: false, error: `Need 5 approved questions to publish. Currently have ${questions?.length || 0}.` };
    }

    const { error: updateError } = await supabase
      .from('quizzes')
      .update({
        status: 'published' as QuizStatus,
        total_questions: questions?.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', quizId);

    if (updateError) return { success: false, error: 'Failed to publish quiz' };

    return { success: true };
  },

  // Delete quiz
  async deleteQuiz(quizId: string): Promise<boolean> {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    return !error;
  },

  // Get quiz statistics
  async getQuizStats(quizId: string): Promise<{
    totalAttempts: number;
    passedCount: number;
    averageScore: number;
    passRate: number;
  }> {
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('score, passed')
      .eq('quiz_id', quizId);

    if (!attempts || attempts.length === 0) {
      return { totalAttempts: 0, passedCount: 0, averageScore: 0, passRate: 0 };
    }

    const totalAttempts = attempts.length;
    const passedCount = attempts.filter((a: { passed: boolean }) => a.passed).length;
    const averageScore = Math.round(attempts.reduce((sum: number, a: { score: number }) => sum + a.score, 0) / totalAttempts);
    const passRate = Math.round((passedCount / totalAttempts) * 100);

    return { totalAttempts, passedCount, averageScore, passRate };
  }
};
