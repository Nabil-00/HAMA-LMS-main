import { supabase } from '../supabaseClient';

export interface InitializePaymentResponse {
  reference: string;
  amount: number;
  email: string;
  currency: string;
  metadata: {
    userId: string;
    courseId: string;
    courseTitle?: string;
  };
}

export interface VerifyPaymentResponse {
  success: boolean;
  paymentStatus: 'pending' | 'success' | 'failed';
  enrolled: boolean;
  message: string;
}

export const initializePayment = async (courseId: string): Promise<InitializePaymentResponse> => {
  const { data, error } = await supabase.functions.invoke('initialize-payment', {
    body: { courseId }
  });

  if (error) {
    throw new Error(error.message || 'Failed to initialize payment');
  }

  if (!data?.reference) {
    throw new Error(data?.error || 'Invalid initialize payment response');
  }

  return data as InitializePaymentResponse;
};

export const verifyPaymentServer = async (
  reference: string,
  transactionReference?: string
): Promise<VerifyPaymentResponse> => {
  const { data, error } = await supabase.functions.invoke('verify-payment', {
    body: { reference, transactionReference }
  });

  if (error) {
    throw new Error(error.message || 'Payment verification failed');
  }

  return data as VerifyPaymentResponse;
};

export const markPaymentFailedServer = async (reference: string, reason: string): Promise<void> => {
  const { error } = await supabase.functions.invoke('mark-payment-failed', {
    body: { reference, reason }
  });

  if (error) {
    throw new Error(error.message || 'Failed to update payment status');
  }
};
