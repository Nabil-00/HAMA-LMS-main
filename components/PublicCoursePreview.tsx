import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, X } from './icons/HamaUIIcons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getCourses } from '../services/courseService';
import { Course } from '../types';
import { resolvePreviewVideoId } from '../utils/coursePreviewVideo';
import { HamaPlayIcon } from './icons';

const PublicCoursePreview: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      const list = await getCourses();
      setCourse(list.find((item) => item.id === courseId) || null);
      setLoading(false);
    };
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    if (!showPreview) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowPreview(false);
      } else if (event.key === 'Tab') {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [showPreview]);

  if (!courseId) return <Navigate to="/" replace />;

  const previewVideoId = course ? resolvePreviewVideoId(course) : null;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F5DC]">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] hover:text-[#F5F5DC] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {loading ? (
          <div className="mt-12 text-[#A0A0A0]">Loading course...</div>
        ) : !course ? (
          <div className="mt-12 glass-card rounded-2xl p-8 border border-white/10">
            <h1 className="text-2xl font-bold serif">Course not found</h1>
            <p className="mt-3 text-[#A0A0A0]">This course may no longer be available.</p>
          </div>
        ) : (
          <div className="mt-8 glass-card rounded-3xl border border-[#D4AF37]/20 overflow-hidden">
            <div className="h-56 md:h-80 bg-black/30 relative">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover opacity-70" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white/20" />
                </div>
              )}

              {previewVideoId && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[#D4AF37]/45 bg-[#111111]/80 text-[#D4AF37] hover:border-[#D4AF37]/80 hover:shadow-[0_0_24px_rgba(212,175,55,0.34)] transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
                    aria-label={`${t('catalog.play_preview')} ${course.title}`}
                  >
                    <HamaPlayIcon size={22} variant="gold" aria-hidden className="ml-0.5" />
                  </button>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] font-black text-[#F5F5DC]">{t('catalog.watch_preview')}</p>
                </div>
              )}
            </div>

            <div className="p-6 md:p-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-black">Course Preview</p>
              <h1 className="mt-3 text-3xl md:text-5xl font-black serif leading-tight break-words">{course.title}</h1>
              <p className="mt-4 text-[#A0A0A0] text-sm md:text-base leading-relaxed">{course.description || 'No description yet.'}</p>

              <div className="mt-8 grid sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#666666] font-black">Price</p>
                  <p className="mt-2 text-lg font-bold text-[#F5F5DC]">{course.isFree ? 'Free' : `NGN ${course.price?.toLocaleString()}`}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#666666] font-black">Modules</p>
                  <p className="mt-2 text-lg font-bold text-[#F5F5DC]">{course.modules?.length || 0}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#666666] font-black">Total lessons</p>
                  <p className="mt-2 text-lg font-bold text-[#F5F5DC] inline-flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D4AF37]" />
                    {course.modules?.reduce((sum, module) => sum + module.lessons.length, 0) || 0}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                  className="px-6 py-3 rounded-xl bg-[#D4AF37] text-[#1A1A1A] font-black text-sm uppercase tracking-[0.18em]"
                >
                  Start Learning
                </button>
                <Link to="/" className="px-6 py-3 rounded-xl border border-[#D4AF37]/20 text-[#F5F5DC] font-black text-sm uppercase tracking-[0.18em]">
                  Browse Courses
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {course && previewVideoId && showPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t('catalog.preview_modal_title')}
        >
          <div
            className="w-full max-w-4xl rounded-2xl border border-[#D4AF37]/30 bg-[#101010] overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-white/10">
              <p className="text-sm md:text-base font-bold text-[#F5F5DC] break-words pr-4">{course.title}</p>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-lg border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
                aria-label={t('catalog.close_preview')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${previewVideoId}?autoplay=1&rel=0&modestbranding=1`}
                title={`${course.title} preview`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicCoursePreview;
