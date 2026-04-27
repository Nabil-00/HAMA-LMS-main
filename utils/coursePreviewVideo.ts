import { Course } from '../types';

const YOUTUBE_ID_PATTERN = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

export const extractYoutubeId = (value?: string): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(YOUTUBE_ID_PATTERN);
  return match ? match[1] : null;
};

export const resolvePreviewVideoId = (course: Course): string | null => {
  const rawCourse = course as unknown as Record<string, unknown>;
  const fromTopLevel =
    extractYoutubeId(rawCourse.previewVideoId as string | undefined) ||
    extractYoutubeId(rawCourse.preview_video_id as string | undefined) ||
    extractYoutubeId(rawCourse.previewVideoUrl as string | undefined) ||
    extractYoutubeId(rawCourse.preview_video_url as string | undefined);

  if (fromTopLevel) return fromTopLevel;

  const modules = Array.isArray(course.modules) ? course.modules : [];
  for (const module of modules) {
    for (const lesson of module.lessons || []) {
      const fromMeta =
        extractYoutubeId(lesson.metadata?.youtubeId) ||
        extractYoutubeId(lesson.metadata?.streamUrl);
      if (fromMeta) return fromMeta;
    }
  }

  return null;
};
