import { useState, useCallback, useEffect } from 'react';
import { QuizWithQuestions, QuizAttempt, Certificate } from '../types';
import { quizService } from '../services/quizService';

interface UseQuizReturn {
  quiz: QuizWithQuestions | null;
  loading: boolean;
  error: string | null;
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string>;
  submitted: boolean;
  result: {
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
    attemptId: string;
  } | null;
  attempts: QuizAttempt[];
  certificate: Certificate | null;
  loadQuiz: (quizId: string) => Promise<void>;
  selectAnswer: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitQuiz: () => Promise<void>;
  loadAttempts: (quizId: string) => Promise<void>;
  loadCertificate: (courseId: string) => Promise<void>;
  generateCertificate: (courseId: string) => Promise<void>;
  reset: () => void;
}

export const useQuiz = (): UseQuizReturn => {
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
    attemptId: string;
  } | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  const loadQuiz = useCallback(async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      const quizData = await quizService.getQuizWithQuestions(quizId);
      if (!quizData) {
        setError('Quiz not found or not published');
        return;
      }
      setQuiz(quizData);
      setSelectedAnswers({});
      setCurrentQuestionIndex(0);
      setSubmitted(false);
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectAnswer = useCallback((questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [quiz, currentQuestionIndex]);

  const prevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const goToQuestion = useCallback((index: number) => {
    if (quiz && index >= 0 && index < quiz.questions.length) {
      setCurrentQuestionIndex(index);
    }
  }, [quiz]);

  const submitQuiz = useCallback(async () => {
    if (!quiz) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await quizService.submitQuiz(quiz.id, selectedAnswers);
      if (response.success) {
        setResult({
          score: response.score!,
          passed: response.passed!,
          correctCount: response.correctCount!,
          totalQuestions: response.totalQuestions!,
          attemptId: response.attemptId!
        });
        setSubmitted(true);
      } else {
        setError(response.error || 'Failed to submit quiz');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  }, [quiz, selectedAnswers]);

  const loadAttempts = useCallback(async (quizId: string) => {
    const userAttempts = await quizService.getUserAttempts(quizId);
    setAttempts(userAttempts);
  }, []);

  const loadCertificate = useCallback(async (courseId: string) => {
    const cert = await quizService.getUserCertificate(courseId);
    setCertificate(cert);
  }, []);

  const generateCertificateAction = useCallback(async (courseId: string) => {
    if (!result?.passed) return;
    
    setLoading(true);
    try {
      const response = await quizService.generateCertificate(courseId, result.attemptId);
      if (response.success) {
        await loadCertificate(courseId);
      } else {
        setError(response.error || 'Failed to generate certificate');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  }, [result, loadCertificate]);

  const reset = useCallback(() => {
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSubmitted(false);
    setResult(null);
    setAttempts([]);
    setCertificate(null);
    setError(null);
  }, []);

  return {
    quiz,
    loading,
    error,
    currentQuestionIndex,
    selectedAnswers,
    submitted,
    result,
    attempts,
    certificate,
    loadQuiz,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitQuiz,
    loadAttempts,
    loadCertificate,
    generateCertificate: generateCertificateAction,
    reset
  };
};
