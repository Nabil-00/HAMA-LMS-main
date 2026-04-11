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

    // Check for existing certificate (avoid duplicates)
    const { data: existingCert } = await supabase
      .from('certificates')
      .select('id, unique_code, certificate_url, issued_at')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    if (existingCert) {
      // Return the existing certificate rather than creating a duplicate
      return new Response(JSON.stringify({
        success: true,
        certificateId: existingCert.id,
        uniqueCode: existingCert.unique_code,
        certificateUrl: existingCert.certificate_url ?? null,
        message: 'Certificate already exists'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create certificate record
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

    if (certError || !certificate) {
      return new Response(JSON.stringify({ error: 'Failed to create certificate record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // --- Phase 1: Generate PDF via render-certificate-pdf ---
    const issuedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const internalSecret = Deno.env.get('INTERNAL_SECRET')
    let certificateUrl: string | null = null

    if (!internalSecret) {
      // INTERNAL_SECRET not configured — skip PDF generation gracefully.
      // The certificate record is still created; URL will remain null.
      console.warn('INTERNAL_SECRET is not set — skipping PDF generation. Set the secret and redeploy to enable PDF storage.')
    } else {
      try {
        // Call the render-certificate-pdf sibling function.
        // It lives at the same Supabase project, so we call it via the functions URL.
        const renderUrl = `${supabaseUrl}/functions/v1/render-certificate-pdf`

        const pdfResponse = await fetch(renderUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Secret': internalSecret,
            // Pass the service-role key as apikey so the Functions gateway allows the call
            'apikey': supabaseKey,
          },
          body: JSON.stringify({
            recipientName: userName,
            courseName: courseTitle,
            completionDate: issuedDate,
            uniqueCode: uniqueCode,
            instructorName: 'HAMA Academy Management',
          }),
        })

        if (!pdfResponse.ok) {
          const errText = await pdfResponse.text()
          console.error(`render-certificate-pdf returned ${pdfResponse.status}: ${errText}`)
          // Non-fatal: continue and return null certificateUrl
        } else {
          const pdfBytes = await pdfResponse.arrayBuffer()

          // Upload the PDF to the 'certificates' storage bucket.
          // Path: {userId}/{uniqueCode}.pdf
          // The service-role key bypasses all RLS policies on storage.
          const storagePath = `${user.id}/${uniqueCode}.pdf`

          const { error: uploadError } = await supabase
            .storage
            .from('certificates')
            .upload(storagePath, pdfBytes, {
              contentType: 'application/pdf',
              upsert: false, // unique code guarantees no collision, but be explicit
            })

          if (uploadError) {
            console.error('Storage upload failed:', uploadError.message)
            // Non-fatal — certificate record still exists
          } else {
            // Get the public URL of the uploaded PDF
            const { data: urlData } = supabase
              .storage
              .from('certificates')
              .getPublicUrl(storagePath)

            certificateUrl = urlData?.publicUrl ?? null

            // Update the certificate record with the storage URL
            if (certificateUrl) {
              const { error: updateError } = await supabase
                .from('certificates')
                .update({ certificate_url: certificateUrl })
                .eq('id', certificate.id)

              if (updateError) {
                console.error('Failed to update certificate_url in DB:', updateError.message)
                // Certificate URL is still returned to client even if DB update fails
              }
            }
          }
        }
      } catch (pdfErr) {
        // PDF generation is non-fatal: certificate still exists in DB without a URL
        console.error('PDF generation pipeline error:', pdfErr)
      }
    }

    // Return certificate data including the storage URL (may be null if PDF gen failed/not configured)
    return new Response(JSON.stringify({
      success: true,
      certificateId: certificate.id,
      uniqueCode: uniqueCode,
      certificateUrl: certificateUrl,
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
