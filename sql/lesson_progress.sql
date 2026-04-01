-- Lesson Progress Table
-- Tracks which lessons a student has completed in each course

CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    lesson_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT true NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users read own progress" ON public.lesson_progress;
CREATE POLICY "Users read own progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own progress" ON public.lesson_progress;
CREATE POLICY "Users update own progress" ON public.lesson_progress FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all progress" ON public.lesson_progress;
CREATE POLICY "Admins read all progress" ON public.lesson_progress FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_course ON public.lesson_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course ON public.lesson_progress(course_id);
