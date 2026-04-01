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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const myUrl = Deno.env.get('MY_SUPABASE_URL')
    const myKey = Deno.env.get('MY_SERVICE_KEY')

    console.log('--- Debug Info ---')
    console.log('SUPABASE_URL defined:', !!supabaseUrl)
    console.log('SUPABASE_SERVICE_ROLE_KEY defined:', !!serviceKey)
    console.log('MY_SUPABASE_URL defined:', !!myUrl)
    console.log('MY_SERVICE_KEY defined:', !!myKey)

    const supabase = createClient(supabaseUrl!, serviceKey!)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    const apikeyHeader = req.headers.get('apikey')

    console.log('Authorization header present:', !!authHeader)
    console.log('apikey header present:', !!apikeyHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth check failed: Missing or invalid Authorization header')
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing or invalid Authorization header',
        debug: { authHeaderPresent: !!authHeader }
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    const token = authHeader.replace('Bearer ', '')

    // Validate token and get user
    let user;
    try {
      console.log('Attempting to validate token...')
      const { data: userData, error: authError } = await supabase.auth.getUser(token)
      if (authError || !userData?.user) {
        console.log('Token validation failed:', authError?.message)
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid token: ' + (authError?.message || 'No user found'),
          debug: { authErrorCode: authError?.status, authErrorMessage: authError?.message }
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      user = userData.user;
      console.log('User validated successfully:', user.id)
    } catch (e: any) {
      console.log('Token validation exception:', e.message)
      return new Response(JSON.stringify({
        success: false,
        error: 'Token validation failed: ' + e.message
      }), {
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
