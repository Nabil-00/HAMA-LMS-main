import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
    // 1. Security check: Only allow requests with the Vercel Cron Secret
    // Vercel automatically sends this header if configured
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized resonance' });
    }

    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing environment credentials');
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // 2. Perform the daily maintenance (Equivalent to the pg_cron job)
        const { data, error } = await supabase
            .from('courses')
            .update({ last_modified: new Date().toISOString() })
            .eq('status', 'Published');

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'HAMA Daily Resonance Synchronized',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Cron Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
