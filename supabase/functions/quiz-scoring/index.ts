import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  quizId: string;
  answers: Record<string, string>; // { questionId: selectedOption }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('MY_SUPABASE_URL')!
    const supabaseKey = Deno.env.get('MY_SERVICE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse request body
    const { quizId, answers }: RequestBody = await req.json()

    if (!quizId || !answers || Object.keys(answers).length === 0) {
      return new Response(JSON.stringify({ error: 'Missing quizId or answers' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch approved questions for the quiz
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, correct_option, status')
      .eq('quiz_id', quizId)
      .eq('status', 'approved')

    if (questionsError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch questions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!questions || questions.length === 0) {
      return new Response(JSON.stringify({ error: 'No approved questions found for this quiz' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch quiz to get pass percentage
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('pass_percentage, total_questions')
      .eq('id', quizId)
      .single()

    if (quizError || !quiz) {
      return new Response(JSON.stringify({ error: 'Quiz not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate score
    let correctCount = 0
    for (const question of questions) {
      if (answers[question.id] === question.correct_option) {
        correctCount++
      }
    }

    const totalQuestions = questions.length
    const score = Math.round((correctCount / totalQuestions) * 100)
    const passThreshold = quiz.pass_percentage
    const passed = score >= passThreshold

    // Record attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        quiz_id: quizId,
        score: score,
        passed: passed,
        answers: answers
      })
      .select()
      .single()

    if (attemptError) {
      return new Response(JSON.stringify({ error: 'Failed to record attempt' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      score: score,
      passed: passed,
      correctCount: correctCount,
      totalQuestions: totalQuestions,
      passThreshold: passThreshold,
      attemptId: attempt.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
