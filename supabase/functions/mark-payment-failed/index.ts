import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  reference: string
  reason?: string
}

const createResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const updateFailed = async (supabase: any, reference: string, values: Record<string, unknown>) => {
  const first = await supabase.from('payments').update(values).eq('reference', reference).eq('status', 'pending')
  if (!first.error) return first

  const fallback = { ...values }
  if ('gateway_response' in fallback) {
    fallback.paystack_response = fallback.gateway_response
    delete fallback.gateway_response
  }
  delete fallback.gateway

  return await supabase.from('payments').update(fallback).eq('reference', reference).eq('status', 'pending')
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

    const { reference, reason = 'checkout_cancelled' }: RequestBody = await req.json()
    if (!reference) {
      return createResponse({ error: 'Missing reference' }, 400)
    }

    const { error } = await updateFailed(supabase, reference, {
      status: 'failed',
      updated_at: new Date().toISOString(),
      gateway: 'paystack',
      gateway_response: { reason },
    })

    if (error) {
      return createResponse({ error: 'Failed to update payment status' }, 500)
    }

    return createResponse({ success: true })
  } catch (error) {
    return createResponse({ error: (error as Error).message }, 500)
  }
})
