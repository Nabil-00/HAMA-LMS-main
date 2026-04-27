import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  courseId: string
}

const createResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const createReference = () => {
  const stamp = Date.now()
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()
  return `HAMA_${stamp}_${rand}`
}

const insertPaymentRecord = async (supabase: any, values: Record<string, unknown>) => {
  const primary = await supabase.from('payments').insert(values).select().single()
  if (!primary.error) return primary

  const fallback = { ...values }
  delete fallback.gateway
  const secondary = await supabase.from('payments').insert(fallback).select().single()
  return secondary
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return createResponse({ error: 'Missing or invalid Authorization header' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: authError } = await supabase.auth.getUser(token)
    if (authError || !userData?.user) {
      return createResponse({ error: 'Unauthorized' }, 401)
    }

    const { courseId }: RequestBody = await req.json()
    if (!courseId) {
      return createResponse({ error: 'Missing courseId' }, 400)
    }

    const user = userData.user

    const [{ data: profile }, { data: course, error: courseError }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).single(),
      supabase
        .from('courses')
        .select('id, title, price, is_free, status')
        .eq('id', courseId)
        .eq('status', 'Published')
        .single(),
    ])

    if (courseError || !course) {
      return createResponse({ error: 'Course not found or unavailable' }, 404)
    }

    if (profile?.role === 'Admin' || profile?.role === 'Teacher') {
      return createResponse({ error: 'Payment is not required for this account' }, 400)
    }

    if (course.is_free) {
      return createResponse({ error: 'Course is free and does not require payment' }, 400)
    }

    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    if (existingEnrollment) {
      return createResponse({ error: 'User already enrolled in this course' }, 409)
    }

    const reference = createReference()
    const paymentValues = {
      user_id: user.id,
      course_id: courseId,
      amount: Number(course.price || 0),
      currency: 'NGN',
      reference,
      status: 'pending',
      gateway: 'paystack',
      updated_at: new Date().toISOString(),
    }

    const { error: paymentError } = await insertPaymentRecord(supabase, paymentValues)
    if (paymentError) {
      return createResponse({ error: 'Failed to initialize payment' }, 500)
    }

    return createResponse({
      reference,
      amount: Number(course.price || 0),
      currency: 'NGN',
      email: user.email,
      metadata: {
        userId: user.id,
        courseId: course.id,
        courseTitle: course.title,
      },
    })
  } catch (error) {
    return createResponse({ error: (error as Error).message }, 500)
  }
})
