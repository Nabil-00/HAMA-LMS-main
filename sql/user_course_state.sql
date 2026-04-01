-- User Course State Table
-- Tracks last lesson viewed for resume functionality

CREATE TABLE IF NOT EXISTS public.user_course_state (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    last_lesson_id TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

ALTER TABLE public.user_course_state ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users read own course state" ON public.user_course_state;
CREATE POLICY "Users read own course state" ON public.user_course_state FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own course state" ON public.user_course_state;
CREATE POLICY "Users update own course state" ON public.user_course_state FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_course_state_user_course ON public.user_course_state(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_state_updated ON public.user_course_state(updated_at);
