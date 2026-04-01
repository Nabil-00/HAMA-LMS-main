import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  courseId: string;
  quizAttemptId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse request body
    const { courseId, quizAttemptId }: RequestBody = await req.json()

    if (!courseId) {
      return new Response(JSON.stringify({ error: 'Missing courseId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify user has a passing attempt for this course
    let attempt = null
    if (quizAttemptId) {
      const { data: attemptData } = await supabase
        .from('quiz_attempts')
        .select('id, quiz_id, score, passed')
        .eq('id', quizAttemptId)
        .eq('user_id', user.id)
        .eq('passed', true)
        .single()
      attempt = attemptData
    } else {
      // Find any passing attempt for this course
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('id')
        .eq('course_id', courseId)
        .single()

      if (quizData) {
        const { data: attemptData } = await supabase
          .from('quiz_attempts')
          .select('id, quiz_id, score, passed')
          .eq('quiz_id', quizData.id)
          .eq('user_id', user.id)
          .eq('passed', true)
          .order('attempted_at', { ascending: false })
          .limit(1)
          .single()
        attempt = attemptData
      }
    }

    if (!attempt) {
      return new Response(JSON.stringify({ error: 'No passing quiz attempt found. Complete the quiz with 70% or higher to earn a certificate.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch user and course details
    const [userRes, courseRes] = await Promise.all([
      supabase.from('profiles').select('name').eq('id', user.id).single(),
      supabase.from('courses').select('title').eq('id', courseId).single()
    ])

    const userName = userRes.data?.name || 'Student'
    const courseTitle = courseRes.data?.title || 'Course'

    // Generate unique certificate code
    const uniqueCode = `HAMA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Create certificate record first
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .insert({
        user_id: user.id,
        course_id: courseId,
        unique_code: uniqueCode,
        quiz_attempt_id: attempt.id
      })
      .select()
      .single()

    if (certError) {
      return new Response(JSON.stringify({ error: 'Failed to create certificate record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate PDF using canvas-based approach
    // Since we can't use jspdf directly, we'll create a simple HTML-based PDF
    const issuedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Create a simple certificate as base64 image using canvas
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@400;600&display=swap');
        </style>
      </head>
      <body style="margin:0;padding:0;width:800px;height:600px;position:relative;background:#1A1A1A;font-family:'Montserrat',sans-serif;">
        <!-- Gold Border -->
        <div style="position:absolute;top:15px;left:15px;right:15px;bottom:15px;border:4px solid #D4AF37;border-radius:8px;"></div>
        <div style="position:absolute;top:25px;left:25px;right:25px;bottom:25px;border:1px solid #D4AF37;border-radius:4px;"></div>
        
        <!-- Watermark Pattern -->
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0.05;font-size:120px;color:#D4AF37;font-family:'Playfair Display',serif;">♫</div>
        
        <!-- Content -->
        <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px;text-align:center;">
          <!-- Logo -->
          <div style="font-size:48px;color:#D4AF37;margin-bottom:20px;">🎵</div>
          
          <!-- Header -->
          <h1 style="font-family:'Playfair Display',serif;font-size:36px;color:#D4AF37;margin:0 0 10px 0;font-weight:700;">HAMA LMS</h1>
          <p style="color:#A0A0A0;font-size:14px;margin:0 0 30px 0;letter-spacing:3px;text-transform:uppercase;">Learning Management System</p>
          
          <!-- Certificate Title -->
          <h2 style="font-family:'Playfair Display',serif;font-size:28px;color:#F5F5DC;margin:0 0 30px 0;">Certificate of Completion</h2>
          
          <!-- Student Name -->
          <p style="color:#A0A0A0;font-size:14px;margin:0 0 10px 0;">This is to certify that</p>
          <h3 style="font-family:'Playfair Display',serif;font-size:32px;color:#F5F5DC;margin:0 0 30px 0;font-weight:400;">${userName}</h3>
          
          <!-- Course -->
          <p style="color:#A0A0A0;font-size:14px;margin:0 0 10px 0;">has successfully completed the course</p>
          <h4 style="font-size:20px;color:#D4AF37;margin:0 0 30px 0;font-weight:600;">${courseTitle}</h4>
          
          <!-- Date & Code -->
          <div style="display:flex;justify-content:space-between;width:100%;max-width:400px;margin-top:20px;">
            <div style="text-align:left;">
              <p style="color:#A0A0A0;font-size:12px;margin:0 0 5px 0;">Date Issued</p>
              <p style="color:#F5F5DC;font-size:14px;margin:0;">${issuedDate}</p>
            </div>
            <div style="text-align:right;">
              <p style="color:#A0A0A0;font-size:12px;margin:0 0 5px 0;">Certificate ID</p>
              <p style="color:#D4AF37;font-size:14px;margin:0;font-family:monospace;">${uniqueCode}</p>
            </div>
          </div>
          
          <!-- Signature -->
          <div style="margin-top:40px;padding-top:20px;border-top:1px solid #333;width:100%;max-width:300px;">
            <p style="color:#A0A0A0;font-size:11px;margin:0 0 10px 0;text-align:center;">Authorized Signature</p>
            <div style="font-family:'Playfair Display',serif;font-size:24px;color:#D4AF37;text-align:center;">HAMA LMS</div>
          </div>
        </div>
      </body>
      </html>
    `

    // For now, return the certificate with the HTML content as a data URL
    // In production, you'd use a library like puppeteer or convert HTML to PDF server-side
    return new Response(JSON.stringify({
      success: true,
      certificateId: certificate.id,
      uniqueCode: uniqueCode,
      htmlContent: htmlContent,
      message: 'Certificate created successfully'
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
