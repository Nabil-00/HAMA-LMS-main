import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get unique code from URL params
    const url = new URL(req.url)
    const uniqueCode = url.searchParams.get('code')

    if (!uniqueCode) {
      return new Response(JSON.stringify({
        valid: false,
        message: 'Certificate code is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch certificate with user and course details
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(`
        id,
        unique_code,
        issued_at,
        user_id,
        course_id,
        profiles!inner(name),
        courses!inner(title)
      `)
      .eq('unique_code', uniqueCode)
      .single()

    if (error || !certificate) {
      return new Response(JSON.stringify({
        valid: false,
        message: 'Certificate not found or invalid'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Format the response
    const issuedDate = new Date(certificate.issued_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    return new Response(JSON.stringify({
      valid: true,
      certificate: {
        id: certificate.id,
        uniqueCode: certificate.unique_code,
        issuedAt: issuedDate,
        userName: certificate.profiles?.name,
        courseTitle: certificate.courses?.title
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      valid: false,
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
