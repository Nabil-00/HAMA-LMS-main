import { supabase } from '../supabaseClient';

export interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  completedLessonIds: string[];
}

export interface LessonProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string;
  createdAt: string;
}

export const progressService = {
  /**
   * Mark a lesson as complete for a user
   * Uses upsert to handle duplicate entries gracefully
   */
  async markLessonComplete(userId: string, courseId: string, lessonId: string): Promise<LessonProgress | null> {
    if (!userId || !courseId || !lessonId) {
      console.error('Missing required parameters for markLessonComplete');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,course_id,lesson_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error marking lesson complete:', error);
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        courseId: data.course_id,
        lessonId: data.lesson_id,
        completed: data.completed,
        completedAt: data.completed_at,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Exception in markLessonComplete:', error);
      return null;
    }
  },

  /**
   * Get progress for a specific course
   * Calculates total lessons from course.modules JSONB and completed from lesson_progress
   */
  async getCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
    if (!userId || !courseId) {
      console.error('Missing required parameters for getCourseProgress');
      return null;
    }

    try {
      // Fetch course to get total lessons from modules JSONB
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('modules')
        .eq('id', courseId)
        .single();

      if (courseError || !course) {
        console.error('Error fetching course:', courseError);
        return null;
      }

      // Calculate total lessons from modules JSONB
      const modules = course.modules || [];
      const totalLessons = modules.reduce((sum: number, module: any) => {
        return sum + (module.lessons?.length || 0);
      }, 0);

      if (totalLessons === 0) {
        return {
          courseId,
          totalLessons: 0,
          completedLessons: 0,
          percentage: 0,
          completedLessonIds: []
        };
      }

      // Fetch completed lessons for this user and course
      const { data: progress, error: progressError } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('completed', true);

      if (progressError) {
        console.error('Error fetching progress:', progressError);
        return null;
      }

      const completedLessonIds = (progress || []).map((p: any) => p.lesson_id);
      const completedLessons = completedLessonIds.length;
      const percentage = Math.round((completedLessons / totalLessons) * 100);

      return {
        courseId,
        totalLessons,
        completedLessons,
        percentage,
        completedLessonIds
      };
    } catch (error) {
      console.error('Exception in getCourseProgress:', error);
      return null;
    }
  },

  /**
   * Get all progress records for a user across all courses
   */
  async getUserAllProgress(userId: string): Promise<CourseProgress[]> {
    if (!userId) {
      console.error('Missing userId for getUserAllProgress');
      return [];
    }

    try {
      // Get all courses the user is enrolled in
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', userId)
        .eq('status', 'Active');

      if (enrollError || !enrollments || enrollments.length === 0) {
        return [];
      }

      const courseIds = enrollments.map((e: any) => e.course_id);

      // Get all courses with their modules
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, modules')
        .in('id', courseIds);

      if (coursesError || !courses) {
        console.error('Error fetching courses:', coursesError);
        return [];
      }

      // Get all progress records for this user
      const { data: allProgress, error: progressError } = await supabase
        .from('lesson_progress')
        .select('course_id, lesson_id')
        .eq('user_id', userId)
        .eq('completed', true);

      if (progressError) {
        console.error('Error fetching all progress:', progressError);
        return [];
      }

      // Build progress for each course
      const progressMap = new Map<string, string[]>();
      (allProgress || []).forEach((p: any) => {
        if (!progressMap.has(p.course_id)) {
          progressMap.set(p.course_id, []);
        }
        progressMap.get(p.course_id)!.push(p.lesson_id);
      });

      return courses.map((course: any) => {
        const modules = course.modules || [];
        const totalLessons = modules.reduce((sum: number, module: any) => {
          return sum + (module.lessons?.length || 0);
        }, 0);

        const completedLessonIds = progressMap.get(course.id) || [];
        const completedLessons = completedLessonIds.length;
        const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
          courseId: course.id,
          totalLessons,
          completedLessons,
          percentage,
          completedLessonIds
        };
      });
    } catch (error) {
      console.error('Exception in getUserAllProgress:', error);
      return [];
    }
  },

  /**
   * Check if user has completed at least X% of lessons to access quiz
   * @param requiredPercentage Default 80%
   */
  async canAccessQuiz(userId: string, courseId: string, requiredPercentage: number = 80): Promise<{
    allowed: boolean;
    progress: CourseProgress | null;
    message?: string;
  }> {
    const progress = await this.getCourseProgress(userId, courseId);

    if (!progress) {
      return {
        allowed: false,
        progress: null,
        message: 'Unable to check progress'
      };
    }

    if (progress.percentage >= requiredPercentage) {
      return {
        allowed: true,
        progress
      };
    }

    return {
      allowed: false,
      progress,
      message: `Complete at least ${requiredPercentage}% of lessons to access the quiz`
    };
  },

  /**
   * Reset progress for a specific lesson (undo completion)
   */
  async resetLessonProgress(userId: string, courseId: string, lessonId: string): Promise<boolean> {
    if (!userId || !courseId || !lessonId) {
      console.error('Missing required parameters for resetLessonProgress');
      return false;
    }

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .delete()
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('lesson_id', lessonId);

      if (error) {
        console.error('Error resetting lesson progress:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception in resetLessonProgress:', error);
      return false;
    }
  },

  /**
   * Get user's last viewed lesson for a course (resume functionality)
   */
  async getUserCourseState(userId: string, courseId: string): Promise<{
    lastLessonId: string | null;
  } | null> {
    if (!userId || !courseId) {
      console.error('Missing required parameters for getUserCourseState');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_course_state')
        .select('last_lesson_id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error getting user course state:', error);
        return null;
      }

      return {
        lastLessonId: data?.last_lesson_id || null
      };
    } catch (error) {
      console.error('Exception in getUserCourseState:', error);
      return null;
    }
  },

  /**
   * Update user's last viewed lesson for a course
   */
  async updateUserCourseState(userId: string, courseId: string, lessonId: string): Promise<boolean> {
    if (!userId || !courseId || !lessonId) {
      console.error('Missing required parameters for updateUserCourseState');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_course_state')
        .upsert({
          user_id: userId,
          course_id: courseId,
          last_lesson_id: lessonId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,course_id'
        });

      if (error) {
        console.error('Error updating user course state:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception in updateUserCourseState:', error);
      return false;
    }
  }
};
