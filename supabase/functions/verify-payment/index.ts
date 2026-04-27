import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  reference: string
  transactionReference?: string
}

const createResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const updatePaymentRecord = async (
  supabase: any,
  reference: string,
  values: Record<string, unknown>
) => {
  const first = await supabase
    .from('payments')
    .update(values)
    .eq('reference', reference)
    .select()
    .single()

  if (!first.error) return first

  const fallback = { ...values }
  if ('gateway_response' in fallback) {
    fallback.paystack_response = fallback.gateway_response
    delete fallback.gateway_response
  }
  delete fallback.gateway

  const second = await supabase
    .from('payments')
    .update(fallback)
    .eq('reference', reference)
    .select()
    .single()

  return second
}

const updateToFailed = async (supabase: any, reference: string, reason: string, payload?: unknown) => {
  const updateValues: Record<string, unknown> = {
    status: 'failed',
    updated_at: new Date().toISOString(),
    gateway: 'paystack',
  }

  if (payload) {
    updateValues.gateway_response = payload
  } else {
    updateValues.gateway_response = { reason }
  }

  await updatePaymentRecord(supabase, reference, updateValues)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY')
    const supabase = createClient(supabaseUrl, serviceKey)

    if (!paystackSecret) {
      return createResponse({ error: 'PAYSTACK_SECRET_KEY is not configured' }, 500)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return createResponse({ error: 'Missing or invalid Authorization header' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: authError } = await supabase.auth.getUser(token)
    if (authError || !userData?.user) {
      return createResponse({ error: 'Unauthorized' }, 401)
    }

    const { reference }: RequestBody = await req.json()
    if (!reference) {
      return createResponse({ error: 'Missing reference' }, 400)
    }

    const user = userData.user
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, user_id, course_id, amount, currency, reference, status')
      .eq('reference', reference)
      .eq('user_id', user.id)
      .single()

    if (paymentError || !payment) {
      return createResponse({ error: 'Payment not found' }, 404)
    }

    if (payment.status === 'success') {
      return createResponse({
        success: true,
        paymentStatus: 'success',
        enrolled: true,
        message: 'Payment already verified',
      })
    }

    const verificationRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
    })

    if (!verificationRes.ok) {
      await updateToFailed(supabase, reference, 'verification_request_failed', {
        status: verificationRes.status,
      })
      return createResponse({
        success: false,
        paymentStatus: 'failed',
        enrolled: false,
        message: 'Could not verify transaction with Paystack',
      }, 400)
    }

    const verification = await verificationRes.json()
    const gatewayData = verification?.data
    const paid = verification?.status === true && gatewayData?.status === 'success'
    const amountMatches = Number(gatewayData?.amount || 0) === Math.round(Number(payment.amount) * 100)
    const currencyMatches = (gatewayData?.currency || '').toUpperCase() === String(payment.currency || 'NGN').toUpperCase()
    const referenceMatches = gatewayData?.reference === payment.reference

    if (!paid || !amountMatches || !currencyMatches || !referenceMatches) {
      await updateToFailed(supabase, reference, 'verification_mismatch', verification)
      return createResponse({
        success: false,
        paymentStatus: 'failed',
        enrolled: false,
        message: 'Payment verification failed',
      }, 400)
    }

    const { error: updateError } = await updatePaymentRecord(supabase, reference, {
      status: 'success',
      updated_at: new Date().toISOString(),
      gateway: 'paystack',
      gateway_response: verification,
    })

    if (updateError) {
      return createResponse({ error: 'Failed to update payment status' }, 500)
    }

    const { error: enrollError } = await supabase.from('enrollments').upsert(
      {
        user_id: payment.user_id,
        course_id: payment.course_id,
        enrolled_by: payment.user_id,
        status: 'Active',
        enrolled_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,course_id' }
    )

    if (enrollError) {
      return createResponse({ error: 'Payment verified but enrollment failed' }, 500)
    }

    return createResponse({
      success: true,
      paymentStatus: 'success',
      enrolled: true,
      message: 'Payment verified and enrollment granted',
    })
  } catch (error) {
    return createResponse({ error: (error as Error).message }, 500)
  }
})
