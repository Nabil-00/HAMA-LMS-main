import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Certificate layout configuration - adjust coordinates based on your Canva template
// Template assumed: 1123 x 794 pixels (landscape, high-res)
// PDF points: 1 point = 1/72 inch. For 300 DPI image: 1123 pixels = 1123*72/300 = 269.52 points
const CERT_LAYOUT = {
  // Name field - centered, large font
  name: { x: 269, y: 340, maxWidth: 580, fontSize: 36, color: rgb(0.1, 0.1, 0.1) },
  // Course name - centered, below name
  course: { x: 269, y: 290, maxWidth: 580, fontSize: 24, color: rgb(0.2, 0.2, 0.2) },
  // Date - bottom right
  date: { x: 700, y: 100, fontSize: 14, color: rgb(0.3, 0.3, 0.3) },
  // Certificate ID - bottom left
  certificateId: { x: 80, y: 100, fontSize: 12, color: rgb(0.4, 0.4, 0.4) },
}

interface RequestBody {
  courseId: string;
  quizAttemptId?: string;
}

// Helper to scale font size for long text
function scaleFontSize(text: string, maxWidth: number, baseSize: number, font: any, pageWidth: number): number {
  let fontSize = baseSize
  while (font.widthOfTextAtSize(text, fontSize) > maxWidth && fontSize > 10) {
    fontSize -= 2
  }
  return fontSize
}

// Helper to wrap text if too long
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (font.widthOfTextAtSize(testLine, fontSize) <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
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
    const uniqueCode = `HAMA-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-6)}`

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

    if (certError || !certificate) {
      return new Response(JSON.stringify({ error: 'Failed to create certificate record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate PDF using pdf-lib
    const issuedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })

    let certificateUrl: string | null = null

    try {
      // Create PDF - Landscape letter size: 11 x 8.5 inches
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([792, 612]) // 11 x 8.5 inches in points

      // Embed fonts
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)

      // Draw user name - centered, with auto-scaling
      const nameSize = scaleFontSize(userName, CERT_LAYOUT.name.maxWidth, CERT_LAYOUT.name.fontSize, helveticaBold, 792)
      const nameWidth = helveticaBold.widthOfTextAtSize(userName, nameSize)
      page.drawText(userName, {
        x: (792 - nameWidth) / 2,
        y: CERT_LAYOUT.name.y,
        size: nameSize,
        font: helveticaBold,
        color: CERT_LAYOUT.name.color,
      })

      // Draw course name - centered, with wrapping if needed
      const courseLines = wrapText(courseTitle.toUpperCase(), CERT_LAYOUT.course.maxWidth, helvetica, CERT_LAYOUT.course.fontSize)
      let courseY = CERT_LAYOUT.course.y
      for (const line of courseLines) {
        const lineWidth = helvetica.widthOfTextAtSize(line, CERT_LAYOUT.course.fontSize)
        page.drawText(line, {
          x: (792 - lineWidth) / 2,
          y: courseY,
          size: CERT_LAYOUT.course.fontSize,
          font: helvetica,
          color: CERT_LAYOUT.course.color,
        })
        courseY -= (CERT_LAYOUT.course.fontSize + 8)
      }

      // Draw date - bottom right
      page.drawText(issuedDate, {
        x: CERT_LAYOUT.date.x,
        y: CERT_LAYOUT.date.y,
        size: CERT_LAYOUT.date.fontSize,
        font: helvetica,
        color: CERT_LAYOUT.date.color,
      })

      // Draw certificate ID - bottom left
      page.drawText(`Certificate ID: ${uniqueCode}`, {
        x: CERT_LAYOUT.certificateId.x,
        y: CERT_LAYOUT.certificateId.y,
        size: CERT_LAYOUT.certificateId.fontSize,
        font: helvetica,
        color: CERT_LAYOUT.certificateId.color,
      })

      // Save PDF
      const pdfBytes = await pdfDoc.save()

      // Upload to Supabase Storage
      const storagePath = `${user.id}/${uniqueCode}.pdf`

      const { error: uploadError } = await supabase
        .storage
        .from('certificates')
        .upload(storagePath, pdfBytes, {
          contentType: 'application/pdf',
          upsert: false,
        })

      if (uploadError) {
        console.error('Storage upload failed:', uploadError.message)
      } else {
        // Get public URL
        const { data: urlData } = supabase
          .storage
          .from('certificates')
          .getPublicUrl(storagePath)

        certificateUrl = urlData?.publicUrl ?? null

        // Update certificate record with URL
        if (certificateUrl) {
          await supabase
            .from('certificates')
            .update({ certificate_url: certificateUrl })
            .eq('id', certificate.id)
        }
      }
    } catch (pdfErr) {
      console.error('PDF generation error:', pdfErr)
      // Continue - certificate record exists even without PDF
    }

    // Return certificate data
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
