import { Course } from '../types';
import { supabase } from '../supabaseClient';

export const getCourses = async (): Promise<Course[]> => {
    const { data, error } = await supabase
        .from('courses')
        .select(`
            *,
            profiles:author_id (
                name
            )
        `)
        .order('last_modified', { ascending: false });

    if (error) {
        console.error('Error fetching courses:', error);
        return [];
    }

    return (data as any[]).map(course => ({
        ...course,
        author: course.profiles?.name || 'Unknown Author',
        thumbnailUrl: course.thumbnail_url,
        currentVersion: course.current_version,
        lastModified: course.last_modified,
        modules: course.modules || [],
        tags: course.tags || [],
        versions: course.versions || [],
        auditLog: course.auditLog || [],
        supportedLocales: course.supported_locales || ['en-US'],
        defaultLocale: course.default_locale || 'en-US',
        localizations: course.localizations || {},
        price: course.price || 0,
        isFree: course.is_free ?? true
    })) as Course[];
};

export const saveCourse = async (course: Course): Promise<Course> => {
    const { data, error } = await supabase
        .from('courses')
        .upsert({
            id: course.id === 'new' ? undefined : course.id,
            title: course.title,
            description: course.description,
            thumbnail_url: course.thumbnailUrl,
            status: course.status as any,
            current_version: course.currentVersion,
            tags: course.tags, // Added tags
            default_locale: course.defaultLocale,
            supported_locales: course.supportedLocales,
            localizations: course.localizations,
            modules: course.modules, // Ensure modules are saved as JSONB
            versions: course.versions,
            auditLog: course.auditLog,
            price: course.price,
            is_free: course.isFree,
            last_modified: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving course:', error);
        throw error;
    }
    return data as Course;
};

export const deleteCourse = async (courseId: string): Promise<void> => {
    const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

    if (error) {
        console.error('Error deleting course:', error);
        throw error;
    }
};

export const uploadAsset = async (file: File, bucket = 'course-assets'): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading asset:', uploadError);
        throw uploadError;
    }

    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return data.publicUrl;
};
