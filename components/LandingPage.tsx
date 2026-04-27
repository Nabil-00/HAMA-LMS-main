import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Menu,
  Play,
  X,
} from './icons/HamaUIIcons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getCourses } from '../services/courseService';
import { Course } from '../types';
import { resolvePreviewVideoId } from '../utils/coursePreviewVideo';
import LanguageToggle from './LanguageToggle';
import BrandLogo from './ui/BrandLogo';
import {
  HamaCertificateIcon,
  HamaCoursesIcon,
  HamaProgressIcon,
  HamaUserIcon,
} from './icons';

const shell = 'max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10';

const riseIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const moduleCard =
  'rounded-3xl border border-[#D4AF37]/18 bg-gradient-to-b from-white/[0.07] to-white/[0.03] backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.35)]';

const SectionHead: React.FC<{ eyebrow: string; title: string; description?: string }> = ({
  eyebrow,
  title,
  description,
}) => (
  <div className="max-w-3xl min-w-0">
    <p className="text-[10px] md:text-xs uppercase tracking-[0.32em] text-[#D4AF37] font-black">{eyebrow}</p>
    <h2 className="mt-4 text-[28px] sm:text-4xl lg:text-5xl font-bold leading-tight text-[#F5F5DC] serif break-words">{title}</h2>
    {description && (
      <p className="mt-3 text-[15px] md:text-[17px] text-[#A0A0A0] leading-relaxed">{description}</p>
    )}
  </div>
);

const LandingNavbar: React.FC<{ onStart: () => void; onBrowse: () => void }> = ({ onStart, onBrowse }) => {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const links = [
    { label: t('nav.home'), action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { label: t('nav.courses'), action: onBrowse },
    { label: t('nav.about'), action: () => document.getElementById('why-hama')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) },
    { label: t('nav.contact'), action: () => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0D0D0D]/80 backdrop-blur-xl border-b border-[#D4AF37]/10">
      <div className={`${shell} py-3`}>
        <div className={`${moduleCard} rounded-2xl px-4 sm:px-5 h-[68px] flex items-center justify-between gap-3`}>
          <Link to="/" className="flex items-center min-w-0 gap-2" aria-label="HAMA home">
            <BrandLogo variant="icon" size="md" glow className="brightness-125" />
            <span className="hidden sm:inline text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-black text-[#D4AF37]/70">
              HAMA Academy
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-7 text-[11px] uppercase tracking-[0.2em] text-[#D0D0C3] font-bold">
            {links.map((item) => (
              <button key={item.label} onClick={item.action} className="hover:text-[#D4AF37] transition-colors">
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle size="sm" className="border-[#D4AF37]/55 bg-[#111111]/90" />
            <button
              onClick={onStart}
              className="hidden md:inline-flex px-4 py-2 rounded-xl bg-[#D4AF37] text-[#111111] text-[11px] uppercase tracking-[0.18em] font-black hover:brightness-110 transition-all"
            >
              {t('nav.start_learning')}
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              className="xl:hidden p-2 rounded-lg border border-[#D4AF37]/25 text-[#D4AF37]"
              aria-label="Open menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="xl:hidden mt-3">
            <div className={`${moduleCard} rounded-2xl p-4 space-y-2`}>
              {links.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action();
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs uppercase tracking-[0.2em] font-bold text-[#F5F5DC] hover:bg-white/5"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button onClick={onBrowse} className="px-4 py-2.5 rounded-xl border border-[#D4AF37]/25 text-[#F5F5DC] text-xs uppercase tracking-[0.2em] font-black">
                  {t('nav.browse_courses')}
                </button>
                <button onClick={onStart} className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#1A1A1A] text-xs uppercase tracking-[0.2em] font-black">
                  {t('nav.start_learning')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

const HeroSection: React.FC<{ onStart: () => void; onBrowse: () => void }> = ({ onStart, onBrowse }) => {
  const { t } = useLanguage();

  return (
    <section className={`${shell} pt-8 pb-12 md:pt-10 md:pb-16`}>
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-10 items-start">
        <motion.div variants={riseIn} initial="hidden" whileInView="show" viewport={{ once: true }} className={`${moduleCard} p-6 md:p-8 min-w-0`}>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.34em] text-[#D4AF37] font-black">{t('hero.eyebrow')}</p>
          <h1 className="mt-4 text-[34px] sm:text-[42px] lg:text-[58px] font-bold leading-[1.04] text-[#F5F5DC] serif break-words">
            {t('hero.headline')}
          </h1>
          <p className="mt-4 text-[15px] md:text-[17px] text-[#A0A0A0] max-w-2xl">{t('hero.subheadline')}</p>

          <div className="mt-5">
            <LanguageToggle className="border-[#D4AF37]/50 bg-[#111111]/70" />
          </div>

          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={onStart}
              className="w-full px-6 py-3 rounded-xl bg-[#D4AF37] text-[#1A1A1A] font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 hover:shadow-[0_0_24px_rgba(212,175,55,0.25)] transition-all"
            >
              {t('hero.cta_primary')}
            </button>
            <button
              onClick={onBrowse}
              className="w-full px-6 py-3 rounded-xl border border-[#D4AF37]/30 text-[#F5F5DC] font-black text-xs uppercase tracking-[0.2em] hover:border-[#D4AF37]/65 transition-colors"
            >
              {t('hero.cta_secondary')}
            </button>
          </div>
        </motion.div>

        <motion.div variants={riseIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative min-w-0 h-[320px] sm:h-[360px] lg:h-[420px]">
          <div className={`absolute inset-0 ${moduleCard} p-4 md:p-5`}>
            <div className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-[#171717] via-[#141414] to-[#101010] relative overflow-hidden">
              <div className="absolute top-4 left-4 right-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#D4AF37]/20 bg-black/25 p-3">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#666666] font-black">{t('hero.card_1_label')}</p>
                  <p className="mt-2 text-sm font-bold text-[#F5F5DC]">{t('hero.card_1_value')}</p>
                </div>
                <div className="rounded-xl border border-[#D4AF37]/20 bg-black/25 p-3">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#666666] font-black">{t('hero.card_2_label')}</p>
                  <p className="mt-2 text-sm font-bold text-[#F5F5DC]">{t('hero.card_2_value')}</p>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-4 left-4 right-10 rounded-2xl border border-[#D4AF37]/25 bg-[#111111]/80 p-4"
              >
                <p className="text-[9px] uppercase tracking-[0.24em] text-[#D4AF37] font-black">{t('hero.card_3_label')}</p>
                <div className="mt-3 h-2 rounded-full bg-black/40 overflow-hidden">
                  <motion.div
                    initial={{ width: '52%' }}
                    whileInView={{ width: '76%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F6D77A]"
                  />
                </div>
                <p className="mt-2 text-sm text-[#F5F5DC] font-bold">{t('hero.card_3_value')}</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-20 right-3 rounded-xl border border-[#D4AF37]/25 bg-black/75 px-3 py-2"
              >
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37] font-black">{t('hero.float_badge')}</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const TrustStrip: React.FC = () => {
  const { t } = useLanguage();
  const items = [
    t('social_proof.item_1'),
    t('social_proof.item_2'),
    t('social_proof.item_3'),
    t('social_proof.item_4'),
  ];

  return (
    <section className={`${shell} pb-12 md:pb-16`}>
      <div className={`${moduleCard} p-3 sm:p-4 grid grid-cols-2 lg:grid-cols-4 gap-3`}>
        {items.map((item) => (
          <div key={item} className="rounded-xl border border-[#D4AF37]/18 bg-black/20 p-3 text-center min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#D0D0C3] font-bold break-words">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const FeaturedCourses: React.FC<{
  courses: Course[];
  onBrowse: () => void;
  onOpenPreview: (courseTitle: string, videoId: string) => void;
  onOpenCourse: (courseId: string) => void;
}> = ({ courses, onBrowse, onOpenPreview, onOpenCourse }) => {
  const { t } = useLanguage();

  return (
    <section id="catalog" className={`${shell} py-14 md:py-20`}>
      <SectionHead eyebrow={t('catalog.eyebrow')} title={t('catalog.title')} description={t('catalog.description')} />

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => {
          const previewVideoId = resolvePreviewVideoId(course);

          return (
            <article
              key={course.id}
              role="button"
              tabIndex={0}
              aria-label={`${t('catalog.open_course')} ${course.title}`}
              onClick={(event) => {
                const target = event.target as HTMLElement;
                if (target.closest('[data-card-action="ignore"]')) return;
                onOpenCourse(course.id);
              }}
              onKeyDown={(event) => {
                const target = event.target as HTMLElement;
                if (target.closest('[data-card-action="ignore"]')) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpenCourse(course.id);
                }
              }}
              className={`${moduleCard} overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/65 transition-transform hover:-translate-y-1`}
            >
              <div className="h-44 bg-black/35 relative">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center bg-gradient-to-br from-[#171717] to-[#101010]">
                    <HamaCoursesIcon size={40} variant="muted" className="text-[#D4AF37]/45" aria-hidden />
                  </div>
                )}

                {previewVideoId && (
                  <div className="absolute inset-0 grid place-items-center bg-black/35 pointer-events-none">
                    <div className="text-center">
                      <button
                        type="button"
                        data-card-action="ignore"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onOpenPreview(course.title, previewVideoId);
                        }}
                        className="pointer-events-auto inline-flex items-center justify-center w-14 h-14 rounded-full border border-[#D4AF37]/40 bg-[#111111]/80 text-[#D4AF37] hover:border-[#D4AF37]/80 hover:shadow-[0_0_22px_rgba(212,175,55,0.34)] transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/65"
                        aria-label={`${t('catalog.play_preview')} ${course.title}`}
                      >
                        <Play size={20} className="ml-0.5" />
                      </button>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.18em] font-black text-[#F5F5DC]">{t('catalog.watch_preview')}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col gap-4 h-full min-w-0">
                <h3 className="text-xl font-bold text-[#F5F5DC] leading-snug break-words line-clamp-2">{course.title}</h3>
                <p className="text-sm text-[#A0A0A0] leading-relaxed break-words line-clamp-3">
                  {course.description || t('catalog.fallback_description')}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.22em] font-black border border-[#D4AF37]/25 text-[#D4AF37]">
                    {course.isFree ? t('catalog.free') : `NGN ${course.price?.toLocaleString()}`}
                  </span>
                  <button
                    type="button"
                    data-card-action="ignore"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenCourse(course.id);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-black text-[#F5F5DC] hover:text-[#D4AF37]"
                  >
                    {t('catalog.view_course')} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8">
        <button
          onClick={onBrowse}
          className="px-6 py-3 rounded-xl border border-[#D4AF37]/28 text-[#F5F5DC] font-black text-xs uppercase tracking-[0.2em] hover:border-[#D4AF37]/65"
        >
          {t('catalog.browse_courses')}
        </button>
      </div>
    </section>
  );
};

const WhyHama: React.FC = () => {
  const { t } = useLanguage();
  const bullets = [t('value_1.bullet_1'), t('value_1.bullet_2'), t('value_1.bullet_3')];

  return (
    <section id="why-hama" className={`${shell} py-14 md:py-20`}>
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 lg:gap-8">
        <div className={`${moduleCard} p-6 md:p-8`}>
          <SectionHead eyebrow={t('value_1.eyebrow')} title={t('value_1.title')} description={t('value_1.description')} />
          <ul className="mt-6 space-y-3">
            {bullets.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[#D0D0C3] text-[15px] leading-relaxed">
                <CheckCircle2 size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4">
          <div className={`${moduleCard} p-5`}>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#666666] font-black">{t('value_visual.progress_title')}</p>
            <div className="mt-3 h-2 rounded-full bg-black/40 overflow-hidden"><div className="h-full w-2/3 bg-[#D4AF37]" /></div>
            <p className="mt-2 text-sm font-bold text-[#F5F5DC]">{t('value_visual.completion_desc')}</p>
          </div>
          <div className={`${moduleCard} p-5`}>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#666666] font-black">{t('value_visual.certificate_title')}</p>
            <p className="mt-2 text-sm font-bold text-[#F5F5DC]">{t('value_visual.certificate_desc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const PlatformFeatures: React.FC = () => {
  const { t } = useLanguage();
  const items = [
    { title: t('features.item_1_title'), desc: t('features.item_1_desc'), icon: HamaCoursesIcon },
    { title: t('features.item_2_title'), desc: t('features.item_2_desc'), icon: HamaCertificateIcon },
    { title: t('features.item_3_title'), desc: t('features.item_3_desc'), icon: HamaProgressIcon },
    { title: t('features.item_4_title'), desc: t('features.item_4_desc'), icon: HamaUserIcon },
  ];

  return (
    <section className={`${shell} py-14 md:py-20`}>
      <SectionHead eyebrow={t('features.eyebrow')} title={t('features.title')} />
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.title} className={`${moduleCard} p-5 hover:-translate-y-0.5 transition-transform`}>
            <item.icon size={20} variant="gold" aria-hidden />
            <h3 className="mt-3 text-base font-bold text-[#F5F5DC] break-words">{item.title}</h3>
            <p className="mt-2 text-sm text-[#A0A0A0] leading-relaxed break-words">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const CtaModule: React.FC<{ onStart: () => void; onBrowse: () => void }> = ({ onStart, onBrowse }) => {
  const { t } = useLanguage();

  return (
    <section className={`${shell} py-14 md:py-20`}>
      <div className={`${moduleCard} p-8 md:p-12 bg-gradient-to-r from-[#171717] via-[#141414] to-[#101010] text-center`}>
        <h3 className="text-3xl md:text-4xl font-bold text-[#F5F5DC] serif break-words">{t('cta.title')}</h3>
        <p className="mt-3 text-[15px] md:text-[17px] text-[#A0A0A0] max-w-2xl mx-auto">{t('cta.description')}</p>
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
          <button onClick={onStart} className="px-6 py-3 rounded-xl bg-[#D4AF37] text-[#1A1A1A] font-black text-xs uppercase tracking-[0.2em] hover:brightness-110">
            {t('cta.primary')}
          </button>
          <button onClick={onBrowse} className="px-6 py-3 rounded-xl border border-[#D4AF37]/30 text-[#F5F5DC] font-black text-xs uppercase tracking-[0.2em] hover:border-[#D4AF37]/65">
            {t('cta.secondary')}
          </button>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC<{ onBrowse: () => void; onStart: () => void }> = ({ onBrowse, onStart }) => {
  const { t } = useLanguage();

  return (
    <footer id="footer" className="pb-10">
      <div className={`${shell}`}>
        <div className={`${moduleCard} p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8`}>
          <div>
            <div className="flex items-center gap-3">
              <BrandLogo variant="full" size="sm" subtle />
              <p className="text-xl font-black text-[#F5F5DC] tracking-[0.15em]">{t('nav.brand')}</p>
            </div>
            <p className="mt-2 text-sm text-[#A0A0A0]">{t('footer.subtitle')}</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#D4AF37] font-black">{t('footer.platform')}</p>
            <div className="mt-3 space-y-2 text-sm text-[#D0D0C3]">
              <button onClick={onBrowse} className="block hover:text-[#D4AF37]">{t('footer.courses')}</button>
              <button onClick={() => document.getElementById('why-hama')?.scrollIntoView({ behavior: 'smooth' })} className="block hover:text-[#D4AF37]">{t('footer.about')}</button>
              <button onClick={() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })} className="block hover:text-[#D4AF37]">{t('footer.contact')}</button>
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#D4AF37] font-black">{t('footer.account')}</p>
            <div className="mt-3 space-y-2 text-sm text-[#D0D0C3]">
              <Link to="/login" className="block hover:text-[#D4AF37]">{t('footer.login')}</Link>
              <button onClick={onStart} className="block hover:text-[#D4AF37]">{t('footer.get_started')}</button>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-[#666666]">{t('footer.copyright')}</p>
      </div>
    </footer>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activePreview, setActivePreview] = useState<{ title: string; videoId: string } | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const load = async () => {
      const all = await getCourses();
      setCourses(all.slice(0, 6));
    };
    load();
  }, []);

  useEffect(() => {
    if (!activePreview) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActivePreview(null);
      if (event.key === 'Tab') {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [activePreview]);

  const featuredCourses = useMemo(() => courses, [courses]);

  const startLearning = () => navigate(isAuthenticated ? '/dashboard' : '/login');
  const browseCourses = () => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const openCourseFromCard = (courseId: string) => {
    if (isAuthenticated) {
      navigate(`/course/${courseId}`);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(`/course/${courseId}`)}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] text-[#F5F5DC] overflow-x-clip">
      <div className="noise" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-16 w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#D4AF37]/9 blur-[120px]" />
        <div className="absolute top-[35%] -left-16 w-64 h-64 md:w-80 md:h-80 rounded-full bg-[#046307]/18 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <LandingNavbar onStart={startLearning} onBrowse={browseCourses} />
        <HeroSection onStart={startLearning} onBrowse={browseCourses} />
        <TrustStrip />
        <FeaturedCourses
          courses={featuredCourses}
          onBrowse={browseCourses}
          onOpenPreview={(title, videoId) => setActivePreview({ title, videoId })}
          onOpenCourse={openCourseFromCard}
        />
        <WhyHama />
        <PlatformFeatures />
        <CtaModule onStart={startLearning} onBrowse={browseCourses} />
        <Footer onBrowse={browseCourses} onStart={startLearning} />
      </div>

      {activePreview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActivePreview(null)}
          role="dialog"
          aria-modal="true"
          aria-label={t('catalog.preview_modal_title')}
        >
          <div
            className="w-full max-w-4xl rounded-2xl border border-[#D4AF37]/30 bg-[#101010] overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-white/10">
              <p className="text-sm md:text-base font-bold text-[#F5F5DC] break-words pr-4">{activePreview.title}</p>
              <button
                type="button"
                ref={closeButtonRef}
                onClick={() => setActivePreview(null)}
                className="p-2 rounded-lg border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
                aria-label={t('catalog.close_preview')}
              >
                <X size={16} />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activePreview.videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={`${activePreview.title} preview`}
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

export default LandingPage;
