import { User, Enrollment } from '../types';
import { supabase } from '../supabaseClient';

// --- USER MANAGEMENT ---

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('joined_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return (data as any[]).map(profile => ({
    ...profile,
    avatarUrl: profile.avatar_url,
    joinedAt: profile.joined_at,
    lastLogin: profile.last_login
  })) as User[];
};

export const saveUser = async (user: User): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      name: user.name,
      role: user.role,
      status: user.status,
      avatar_url: user.avatarUrl,
      department: user.department,
      joined_at: user.joinedAt
    })
    .select()
    .single();

  if (error) throw error;
  return data as User;
};

export const deleteUser = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) throw error;
};

export const createUser = async (data: Partial<User>): Promise<User> => {
  // Note: For actual user creation with Auth, use supabase.auth.signUp
  // This helper is for manual profile creation/updates
  const newUser = {
    name: data.name || 'New User',
    role: data.role || 'Student',
    status: data.status || 'Active',
    avatar_url: '',
    department: data.department || '',
    joined_at: new Date().toISOString()
  };

  const { data: profile, error } = await supabase
    .from('profiles')
    .insert(newUser)
    .select()
    .single();

  if (error) throw error;
  return profile as User;
};

// --- ENROLLMENT MANAGEMENT ---

export const getEnrollments = async (): Promise<Enrollment[]> => {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*');

  if (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }
  return (data as any[]).map(enrollment => ({
    id: enrollment.id,
    userId: enrollment.user_id,
    courseId: enrollment.course_id,
    enrolledAt: enrollment.enrolled_at,
    enrolledBy: enrollment.enrolled_by,
    status: enrollment.status
  })) as Enrollment[];
};

export const enrollUser = async (userId: string, courseId: string, adminId: string): Promise<Enrollment> => {
  const { data, error } = await supabase
    .from('enrollments')
    .upsert({
      user_id: userId,
      course_id: courseId,
      enrolled_by: adminId,
      status: 'Active',
      enrolled_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data as Enrollment;
};

export const unenrollUser = async (userId: string, courseId: string): Promise<void> => {
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .match({ user_id: userId, course_id: courseId });

  if (error) throw error;
};

export const getUserEnrollments = async (userId: string): Promise<Enrollment[]> => {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user enrollments:', error);
    return [];
  }
  return (data as any[]).map(enrollment => ({
    id: enrollment.id,
    userId: enrollment.user_id,
    courseId: enrollment.course_id,
    enrolledAt: enrollment.enrolled_at,
    enrolledBy: enrollment.enrolled_by,
    status: enrollment.status
  })) as Enrollment[];
};

export const bulkEnroll = async (userIds: string[], courseId: string, adminId: string): Promise<number> => {
  const enrollments = userIds.map(uid => ({
    user_id: uid,
    course_id: courseId,
    enrolled_by: adminId,
    status: 'Active',
    enrolled_at: new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from('enrollments')
    .upsert(enrollments)
    .select();

  if (error) throw error;
  return data ? data.length : userIds.length;
};

// --- PAYMENTS ---

export interface Payment {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  currency: string;
  reference: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  paystack_response?: any;
  created_at: string;
  updated_at: string;
}

export const createPayment = async (
  userId: string,
  courseId: string,
  amount: number,
  reference: string
): Promise<Payment> => {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      course_id: courseId,
      amount,
      reference,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data as Payment;
};

export const verifyPayment = async (
  reference: string,
  paystackResponse: any
): Promise<{ payment: Payment; enrollment: Enrollment } | null> => {
  try {
    // Update payment status to success
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'success',
        paystack_response: paystackResponse,
        updated_at: new Date().toISOString()
      })
      .eq('reference', reference)
      .select()
      .single();

    if (paymentError || !payment) {
      console.error('Payment update failed:', paymentError);
      return null;
    }

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .upsert({
        user_id: payment.user_id,
        course_id: payment.course_id,
        enrolled_by: payment.user_id,
        status: 'Active',
        enrolled_at: new Date().toISOString()
      })
      .select()
      .single();

    if (enrollError) {
      console.error('Enrollment failed:', enrollError);
      return null;
    }

    return { payment, enrollment };
  } catch (error) {
    console.error('Verify payment error:', error);
    return null;
  }
};

export const getPaymentByReference = async (reference: string): Promise<Payment | null> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('reference', reference)
    .single();

  if (error) return null;
  return data as Payment;
};

export const getUserPayments = async (userId: string): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Payment[];
};