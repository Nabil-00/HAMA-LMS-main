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
        author: course.author || course.profiles?.name || 'Unknown Author',
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

export const saveCourse = async (course: Course, authorId?: string): Promise<Course> => {
    const { data, error } = await supabase
        .from('courses')
        .upsert({
            id: course.id === 'new' ? undefined : course.id,
            title: course.title,
            description: course.description,
            author: course.author,
            thumbnail_url: course.thumbnailUrl,
            status: course.status as any,
            current_version: course.currentVersion,
            tags: course.tags,
            default_locale: course.defaultLocale,
            supported_locales: course.supportedLocales,
            localizations: course.localizations,
            modules: course.modules,
            versions: course.versions,
            price: course.price,
            is_free: course.isFree,
            author_id: authorId || null,
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`);
    }

    if (file.size > maxSize) {
        throw new Error(`File too large. Max size: 100MB`);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
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
