-- Paystack backend-first payment hardening
-- Run this script in Supabase SQL editor before using production payment flow.

ALTER TABLE IF EXISTS public.payments
  ADD COLUMN IF NOT EXISTS gateway TEXT DEFAULT 'paystack';

ALTER TABLE IF EXISTS public.payments
  ADD COLUMN IF NOT EXISTS gateway_response JSONB;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payments'
      AND column_name = 'paystack_response'
  ) THEN
    UPDATE public.payments
    SET gateway_response = COALESCE(gateway_response, paystack_response)
    WHERE paystack_response IS NOT NULL;

    ALTER TABLE public.payments DROP COLUMN paystack_response;
  END IF;
END $$;

DROP POLICY IF EXISTS "Anyone can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;
DROP POLICY IF EXISTS "Students can enroll themselves" ON public.enrollments;

CREATE POLICY "Service role inserts payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role updates payments"
  ON public.payments
  FOR UPDATE
  USING (auth.role() = 'service_role');

UPDATE public.payments
SET gateway = 'paystack'
WHERE gateway IS NULL;

CREATE POLICY "Service role inserts enrollments"
  ON public.enrollments
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
