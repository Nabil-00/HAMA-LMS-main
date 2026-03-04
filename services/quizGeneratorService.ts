import { Question } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';

interface GeminiQuestion {
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer: string;
  explanation: string;
}

export const quizGeneratorService = {
  async generateQuizQuestions(
    courseTitle: string,
    courseDescription: string,
    numQuestions: number = 20
  ): Promise<Question[]> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `You are a music production expert specializing in Hausa music. 
Generate ${numQuestions} multiple choice questions for a course titled "${courseTitle}".
Course description: ${courseDescription}

Each question should:
1. Test practical knowledge about Hausa music production
2. Have 4 options (a, b, c, d) with only one correct answer
3. Include a brief explanation of why the answer is correct
4. Be appropriate for intermediate to advanced learners

Return ONLY a JSON array with ${numQuestions} objects in this exact format:
[{
  "question": "Question text here?",
  "options": {
    "a": "Option A text",
    "b": "Option B text", 
    "c": "Option C text",
    "d": "Option D text"
  },
  "correctAnswer": "a",
  "explanation": "Explanation why this answer is correct"
}]

Do NOT include any other text in your response. Just the JSON array.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content returned from Gemini');
    }

    // Parse the JSON array from the response
    let questions: GeminiQuestion[];
    try {
      // Handle potential markdown code blocks
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      questions = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', content);
      throw new Error('Failed to parse generated questions');
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No questions generated');
    }

    // Convert to our Question format
    return questions.map((q, index) => ({
      id: '', // Will be assigned on save
      quizId: '', // Will be assigned on save
      questionText: q.question,
      optionA: q.options.a,
      optionB: q.options.b,
      optionC: q.options.c,
      optionD: q.options.d,
      correctOption: q.correctAnswer.toLowerCase() as 'a' | 'b' | 'c' | 'd',
      explanation: q.explanation,
      status: 'draft' as const,
      generatedByAi: true,
      orderIndex: index
    }));
  },

  async saveGeneratedQuestions(
    quizId: string,
    questions: Partial<Question>[]
  ): Promise<Question[]> {
    const { supabase } = await import('../supabaseClient');
    
    const questionsToInsert = questions.map((q, index) => ({
      quiz_id: quizId,
      question_text: q.questionText,
      option_a: q.optionA,
      option_b: q.optionB,
      option_c: q.optionC,
      option_d: q.optionD,
      correct_option: q.correctOption,
      explanation: q.explanation,
      status: 'draft',
      generated_by_ai: true,
      order_index: index
    }));

    const { data, error } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (error) {
      console.error('Error saving questions:', error);
      throw new Error('Failed to save generated questions');
    }

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
  }
};
