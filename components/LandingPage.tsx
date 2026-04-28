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

const card = 'border border-[#2a2820] bg-[#0d0c09]';

const SectionHead: React.FC<{ eyebrow: string; title: string; description?: string }> = ({
  eyebrow,
  title,
  description,
}) => (
  <div className="max-w-3xl min-w-0">
    <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold">{eyebrow}</p>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-4 text-[28px] sm:text-4xl lg:text-[42px] font-semibold italic leading-tight text-[#e8e0cc]"
    >
      {title}
    </motion.h2>
    {description && (
      <p className="mt-3 text-[14px] md:text-[15px] text-[#7a7060] leading-[1.8]">{description}</p>
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
    <header className="sticky top-0 z-50 bg-[rgba(10,10,8,0.95)] backdrop-blur-[8px] border-b border-[#2a2820]">
      <div className={`${shell} py-3`}>
        <div className="h-[68px] flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center min-w-0 gap-2" aria-label="HAMA home">
            <BrandLogo variant="icon" size="md" glow className="brightness-125" />
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] font-black text-[#D4AF37]/70">
              HAMA Academy
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-7 text-[12px] tracking-[0.08em] text-[#7a7060] font-semibold">
            {links.map((item) => (
              <button key={item.label} onClick={item.action} className="hover:text-[#D4AF37] transition-colors duration-200">
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="border border-[#2a2820] bg-[#0f0e0a]">
              <LanguageToggle size="sm" className="border-0 bg-transparent [&_button]:rounded-none [&_button[aria-pressed='true']]:bg-[#D4AF37] [&_button[aria-pressed='true']]:text-[#0a0a08] [&_button]:text-[#5a5040]" />
            </div>
            <button
              onClick={onStart}
              className="hidden md:inline-flex px-6 py-[10px] bg-[#D4AF37] text-[#0a0a08] text-[11px] tracking-[0.15em] font-bold"
            >
              {t('nav.start_learning')}
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              className="xl:hidden p-2 border border-[#2a2820] text-[#D4AF37]"
              aria-label="Open menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="xl:hidden mt-3">
            <div className="border border-[#2a2820] bg-[#0d0c09] p-4 space-y-2">
              {links.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action();
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs uppercase tracking-[0.2em] font-bold text-[#e8e0cc] hover:text-[#D4AF37]"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button onClick={onBrowse} className="px-4 py-2.5 border border-[#2a2820] text-[#e8e0cc] text-xs uppercase tracking-[0.2em] font-bold">
                  {t('nav.browse_courses')}
                </button>
                <button onClick={onStart} className="px-4 py-2.5 bg-[#D4AF37] text-[#0a0a08] text-xs uppercase tracking-[0.2em] font-bold">
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

const HeroSection: React.FC<{ onStart: () => void; onBrowse: () => void; courses: Course[]; onOpenPreview: (courseTitle: string, videoId: string) => void; onOpenCourse: (courseId: string) => void; }> = ({ onStart, onBrowse, courses, onOpenPreview, onOpenCourse }) => {
  const { t } = useLanguage();
  const featured = courses[0];
  const previewVideoId = featured ? resolvePreviewVideoId(featured) : null;

  return (
    <section className={`${shell} relative overflow-hidden bg-[#0a0a08] grid lg:grid-cols-2 gap-12 items-center min-h-[88vh] px-12 py-20`}>
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)' }} />

      <motion.div variants={riseIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative min-w-0">
        <p className="inline-block bg-[#1a1600] border border-[#D4AF37] text-[#D4AF37] text-[10px] tracking-[0.3em] px-[14px] py-[6px] font-bold uppercase">
          {t('hero.eyebrow')}
        </p>
        <h1 className="mt-6 text-[clamp(36px,4vw,52px)] italic leading-[1.1] text-[#e8e0cc]">
          {(() => {
            const words = t('hero.headline').split(' ');
            if (words.length < 2) return t('hero.headline');
            return (
              <>
                {words[0]} <span style={{ color: '#D4AF37' }}>{words[1]}</span> {words.slice(2).join(' ')}
              </>
            );
          })()}
        </h1>
        <p className="mt-5 text-[15px] text-[#7a7060] leading-[1.8] max-w-[420px]">{t('hero.subheadline')}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={onStart}
            className="px-9 py-4 bg-[#D4AF37] text-[#0a0a08] font-bold tracking-[0.15em] text-[11px] uppercase"
          >
            {t('hero.cta_primary')}
          </button>
          <button
            onClick={onBrowse}
            className="px-9 py-4 border border-[#3a3828] text-[#e8e0cc] tracking-[0.15em] text-[11px] uppercase"
          >
            {t('hero.cta_secondary')}
          </button>
        </div>

        <div className="border-t border-[#1e1c12] pt-10 mt-12 grid grid-cols-3 gap-4 max-w-[560px]">
          <div>
            <p className="text-3xl text-[#D4AF37]">6+</p>
            <p className="mt-1 text-[10px] tracking-[0.2em] text-[#5a5040] uppercase">DARUSSA</p>
          </div>
          <div>
            <p className="text-3xl text-[#D4AF37]">500+</p>
            <p className="mt-1 text-[10px] tracking-[0.2em] text-[#5a5040] uppercase">ƊALIBAI</p>
          </div>
          <div>
            <p className="text-3xl text-[#D4AF37]">100%</p>
            <p className="mt-1 text-[10px] tracking-[0.2em] text-[#5a5040] uppercase">HAUSA-FIRST</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={riseIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative min-w-0">
        <div className="relative">
          <div style={{ background: '#0d0c09', border: '0.5px solid #2a2820', overflow: 'hidden' }}>
            <div style={{ height: '260px', position: 'relative', background: 'linear-gradient(160deg,#1a0f00,#2a1a05)' }}>
              {featured?.thumbnailUrl ? (
                <img src={featured.thumbnailUrl} alt={featured.title} className="w-full h-full object-cover" />
              ) : null}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(10,10,8,0.95) 0%,transparent 55%)' }} />
              {previewVideoId && featured && (
                <button
                  type="button"
                  onClick={() => onOpenPreview(featured.title, previewVideoId)}
                  className="absolute inset-0 m-auto w-14 h-14 bg-[#D4AF37] grid place-items-center"
                  style={{ width: 56, height: 56 }}
                  aria-label={`${t('catalog.play_preview')} ${featured.title}`}
                >
                  <Play size={20} className="text-[#0a0a08]" />
                </button>
              )}
              <div className="absolute left-4 bottom-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#7a7060]">{t('catalog.watch_preview')}</p>
                <p className="mt-1 text-xl italic text-[#e8e0cc]">{featured?.title || t('hero.card_1_value')}</p>
              </div>
            </div>
            <div style={{ padding: '20px', borderTop: '0.5px solid #1e1c12', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p className="text-[11px] tracking-[0.1em] text-[#5a5040] uppercase">{featured?.author || 'HAMA'}</p>
              <button
                type="button"
                onClick={() => featured && onOpenCourse(featured.id)}
                className="px-4 py-2 bg-[#D4AF37] text-[#0a0a08] text-[10px] tracking-[0.2em] font-bold uppercase"
              >
                FARA KOYO
              </button>
            </div>
          </div>
          <div className="absolute top-3 right-3 bg-[#D4AF37] text-[#0a0a08] text-[9px] font-bold tracking-[0.2em] px-2.5 py-1 uppercase">HAUSA-FIRST</div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-[1px] bg-[#1e1c12]">
          <div className="bg-[#0f0e0a] p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a5040]">Catalog</p>
          </div>
          <div className="bg-[#0f0e0a] p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a5040]">Takarda</p>
          </div>
          <div className="bg-[#0f0e0a] p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a5040]">Ci Gaba</p>
            <div className="mt-2 h-[3px] bg-[#1e1c12]"><div className="h-full w-2/3 bg-[#D4AF37]" /></div>
          </div>
          <div className="bg-[#0f0e0a] p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a5040]">Hausa-First</p>
          </div>
        </div>
      </motion.div>
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
    <section className="bg-[#0d0c09] border-t border-b border-[#1e1c12] py-5 px-12">
      <div className={`${shell} flex flex-wrap gap-8 lg:gap-12 items-center justify-center`}>
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <p className="text-[11px] tracking-[0.2em] text-[#5a5040] uppercase">{item}</p>
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
    <section id="catalog" className={`${shell} py-20 px-12 bg-[#0a0a08]`}>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">{t('catalog.eyebrow')}</p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-4 text-[36px] italic text-[#e8e0cc]"
          >
            {t('catalog.title').split(' ').slice(0, -1).join(' ')} <span className="text-[#D4AF37]">{t('catalog.title').split(' ').slice(-1)}</span>
          </motion.h2>
        </div>
        <button onClick={onBrowse} className="text-[#D4AF37] text-[12px] tracking-[0.15em] border-b border-[#D4AF37] pb-1 uppercase">DUBA DUKA →</button>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-[#1e1c12]">
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
              className="bg-[#0d0c09] overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/65"
            >
              <div className="h-[180px] relative bg-gradient-to-br from-[#171717] to-[#101010]">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center bg-gradient-to-br from-[#171717] to-[#101010]">
                    <HamaCoursesIcon size={40} variant="muted" className="text-[#D4AF37]/45" aria-hidden />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a08] via-transparent" />

                {course.isFree && <span className="absolute top-3 left-3 bg-[#D4AF37] text-[#0a0a08] text-[9px] font-bold tracking-[0.2em] px-2.5 py-1 uppercase">KYAUTA</span>}

                {previewVideoId && (
                  <div className="absolute inset-0 grid place-items-center">
                    <button
                      type="button"
                      data-card-action="ignore"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onOpenPreview(course.title, previewVideoId);
                      }}
                      className="w-11 h-11 bg-[#D4AF37] grid place-items-center"
                      aria-label={`${t('catalog.play_preview')} ${course.title}`}
                    >
                      <Play size={16} className="text-[#0a0a08]" />
                    </button>
                    <button
                      type="button"
                      data-card-action="ignore"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onOpenPreview(course.title, previewVideoId);
                      }}
                      className="absolute bottom-3 right-3 border border-[#2a2820] bg-[rgba(10,10,8,0.8)] text-[#7a7060] text-[9px] tracking-[0.1em] px-2.5 py-1 uppercase"
                    >
                      KALLI PREVIEW
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col gap-4 h-full min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 border border-[#D4AF37] bg-[#1a1600] text-[#D4AF37] text-[10px] grid place-items-center uppercase">
                    {(course.author || 'H').charAt(0)}
                  </span>
                  <p className="text-[11px] color-[#5a5040] tracking-[0.1em] text-[#5a5040] uppercase">{course.author || 'Unknown Author'}</p>
                </div>
                <h3 className="text-[16px] italic text-[#e8e0cc] leading-[1.4] break-words line-clamp-2">{course.title}</h3>
                <p className="text-[12px] text-[#5a5040] leading-[1.7] line-clamp-2">
                  {course.description || t('catalog.fallback_description')}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#1e1c12] pt-[14px]">
                  {course.isFree ? (
                    <span className="border border-[#D4AF37] text-[#D4AF37] text-[11px] tracking-[0.2em] px-2.5 py-1 uppercase">KYAUTA</span>
                  ) : (
                    <span className="text-[18px] text-[#D4AF37]">NGN {course.price?.toLocaleString()}</span>
                  )}
                  <button
                    type="button"
                    data-card-action="ignore"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenCourse(course.id);
                    }}
                    className="bg-[#D4AF37] text-[#0a0a08] text-[10px] font-bold tracking-[0.2em] px-4 py-2 uppercase"
                  >
                    KOYO →
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={onBrowse}
          className="px-8 py-3 border border-[#3a3828] text-[#e8e0cc] text-[11px] tracking-[0.2em] uppercase"
        >
          BINCIKA DARUSSA DUKA
        </button>
      </div>
    </section>
  );
};

const WhyHama: React.FC = () => {
  const { t } = useLanguage();
  const bullets = [t('value_1.bullet_1'), t('value_1.bullet_2'), t('value_1.bullet_3')];

  return (
    <section id="why-hama" className={`${shell} py-20 px-12 bg-[#0d0c09]`}>
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">{t('value_1.eyebrow')}</p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-4 text-[36px] italic text-[#e8e0cc]"
          >
            {t('value_1.title').split(' ').slice(0, -1).join(' ')} <span className="text-[#D4AF37]">{t('value_1.title').split(' ').slice(-1)}</span>
          </motion.h2>
          <div className="w-12 h-[2px] mt-6" style={{ background: 'linear-gradient(90deg,#D4AF37,transparent)' }} />
          <p className="mt-6 text-[14px] text-[#5a5040] leading-[1.9]">{t('value_1.description')}</p>

          <div className="mt-8 flex flex-col gap-4">
            {bullets.map((item) => (
              <div key={item} className="flex items-start gap-3.5">
                <div className="w-9 h-9 bg-[#1a1600] border border-[#2a2010] grid place-items-center"><span className="w-[14px] h-[14px] bg-[#D4AF37]" /></div>
                <div>
                  <p className="text-[#e8e0cc] text-[13px] font-semibold">HAMA Value</p>
                  <p className="text-[#5a5040] text-[12px] leading-[1.7]">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[1px] bg-[#2a2820]">
          {[
            { icon: HamaProgressIcon, title: 'Ci gaba a matakai', desc: 'Koyon da aka rarraba zuwa matakai domin fahimta mai sauki da ci gaba a hankali.' },
            { icon: HamaUserIcon, title: 'Harshen Hausa', desc: 'Dukkan darussa an tsara su cikin Hausa domin kusanci da fahimta mai zurfi.' },
            { icon: HamaCertificateIcon, title: 'Nurin takardar shaida', desc: 'Samun takardar shaida bayan kammala darussa da gwaje-gwaje cikin nasara.' },
            { icon: HamaCoursesIcon, title: 'Darussa na Musamman', desc: 'Abubuwan koyo na zamani da suka dace da rayuwar aiki da kasuwanci.' },
          ].map((item) => (
            <div key={item.title} className="bg-[#0f0e0a] p-[28px]">
              <div className="w-10 h-10 bg-[#1a1600] grid place-items-center"><item.icon size={18} variant="gold" aria-hidden /></div>
              <h3 className="mt-4 mb-2 text-[14px] italic text-[#e8e0cc]">{item.title}</h3>
              <p className="text-[12px] text-[#5a5040] leading-[1.7]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PlatformFeatures: React.FC<{ courses: Course[] }> = ({ courses }) => {
  const instructors = useMemo(() => {
    const map = new Map<string, { name: string; count: number; tags: string[]; desc: string }>();
    for (const course of courses) {
      const name = course.author || 'Unknown Author';
      const current = map.get(name) || { name, count: 0, tags: [], desc: '' };
      current.count += 1;
      current.tags = current.tags.length ? current.tags : (course.tags || []);
      current.desc = current.desc || (course.description || 'Malamin HAMA mai koyar da darussa masu amfani da tasiri.');
      map.set(name, current);
    }
    return Array.from(map.values()).slice(0, 3);
  }, [courses]);

  return (
    <section className={`${shell} py-20 px-12 bg-[#0a0a08]`}>
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">MALAMANMU</p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-4 text-[36px] italic text-[#e8e0cc]"
      >
        Koyi daga <span className="text-[#D4AF37]">gwanayen</span> fagen
      </motion.h2>
      <div className="w-12 h-[2px] mt-6" style={{ background: 'linear-gradient(90deg,#D4AF37,transparent)' }} />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-[#1e1c12]">
        {instructors.map((instructor) => (
          <div key={instructor.name} className="bg-[#0d0c09] p-[28px]">
            <div className="w-16 h-16 rounded-full bg-[#1a1600] border-[1.5px] border-[#D4AF37] grid place-items-center text-[22px] italic text-[#D4AF37] uppercase">
              {instructor.name.charAt(0)}
            </div>
            <h3 className="mt-4 text-[18px] italic text-[#e8e0cc]">{instructor.name}</h3>
            <p className="mt-1 text-[11px] tracking-[0.2em] text-[#D4AF37] uppercase">{instructor.tags[0] || 'MALAMI'}</p>
            <p className="mt-3 text-[12px] text-[#5a5040] leading-[1.7] line-clamp-3">{instructor.desc}</p>
            <div className="mt-4 border-t border-[#1e1c12] pt-3 text-[10px] tracking-[0.1em] text-[#3a3828] uppercase">
              {instructor.count} COURSES • {instructor.count * 120}+ ENROLLED
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Testimonials: React.FC = () => {
  const TESTIMONIALS = [
    { initials: 'AM', name: 'Aisha Mahmoud', course: 'Nazarin Labaran Hausa', quote: 'HAMA Academy ta canza yadda nake kallon ilimi. Koyon Hausa da kuma samun takardar shaida — abin alfahari ne.' },
    { initials: 'IY', name: 'Ibrahim Yusuf', course: 'Shafukan Intanet na Hausa', quote: 'Mafi kyawun shafin koyarwa da na taɓa amfani da shi. Tsari mai kyau, malami mai hazaka, Hausa mai tsarki.' },
    { initials: 'FK', name: 'Fatima Kabir', course: 'Gina Website da AI', quote: 'Na koyi yadda ake gina website cikin mako biyu kawai. Abin mamaki ne! Ina ba da shawara ga kowa.' },
  ];

  return (
    <section className={`${shell} bg-[#0d0c09] border-t border-[#1e1c12] py-20 px-12`}>
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">SHAIDA DAGA ƊALIBAI</p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-4 text-[36px] italic text-[#e8e0cc]"
      >
        Ra'ayoyin <span className="text-[#D4AF37]">dalibai</span>
      </motion.h2>
      <div className="w-12 h-[2px] mt-6" style={{ background: 'linear-gradient(90deg,#D4AF37,transparent)' }} />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-[#1e1c12]">
        {TESTIMONIALS.map((item) => (
          <div key={item.name} className="bg-[#0f0e0a] p-[28px]">
            <p className="text-[#D4AF37] text-[12px]">★★★★★</p>
            <p className="mt-4 text-[14px] italic text-[#b0a890] leading-[1.8] border-l-2 border-[#D4AF37] pl-4">{item.quote}</p>
            <div className="mt-5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1a1600] border border-[#2a2820] text-[#D4AF37] text-[11px] grid place-items-center uppercase">{item.initials}</div>
              <div>
                <p className="text-[12px] text-[#e8e0cc]">{item.name}</p>
                <p className="text-[10px] tracking-[0.1em] text-[#3a3828] uppercase">{item.course}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const CtaModule: React.FC<{ onStart: () => void; onBrowse: () => void }> = ({ onStart, onBrowse }) => {
  const { t } = useLanguage();

  return (
    <section className={`${shell} py-20 px-12 text-center border-t border-b border-[#D4AF37]`} style={{ background: 'linear-gradient(135deg,#1a1600 0%,#0f0d05 50%,#1a1200 100%)' }}>
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">{t('cta.title')}</p>
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-4 text-[42px] italic text-[#e8e0cc]"
      >
        {t('cta.title')}
      </motion.h3>
      <p className="mt-3 text-[14px] text-[#5a5040] max-w-2xl mx-auto">{t('cta.description')}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button onClick={onStart} className="px-8 py-4 bg-[#D4AF37] text-[#0a0a08] font-bold text-[11px] tracking-[0.2em] uppercase">
          {t('cta.primary')}
        </button>
        <button onClick={onBrowse} className="px-8 py-4 border border-[#3a3828] text-[#e8e0cc] font-bold text-[11px] tracking-[0.2em] uppercase">
          {t('cta.secondary')}
        </button>
      </div>
    </section>
  );
};

const Footer: React.FC<{ onBrowse: () => void; onStart: () => void }> = ({ onBrowse, onStart }) => {
  const { t } = useLanguage();

  return (
    <footer id="footer" className="bg-[#050504] border-t border-[#1e1c12] pt-12 pb-8 px-12">
      <div className={`${shell}`}>
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8">
          <div>
            <BrandLogo variant="full" size="sm" subtle />
            <p className="mt-4 text-[12px] text-[#3a3828] leading-[1.8] max-w-[240px]">{t('footer.subtitle')}</p>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] text-[#D4AF37] mb-4 uppercase">DARUSSA</p>
            <button onClick={onBrowse} className="block mb-2 text-[12px] text-[#3a3828] hover:text-[#D4AF37]">Duk Darussa</button>
            <button onClick={onBrowse} className="block mb-2 text-[12px] text-[#3a3828] hover:text-[#D4AF37]">Darussa Kyauta</button>
            <button onClick={onBrowse} className="block mb-2 text-[12px] text-[#3a3828] hover:text-[#D4AF37]">Sabo</button>
            <button onClick={onBrowse} className="block text-[12px] text-[#3a3828] hover:text-[#D4AF37]">Mashahuri</button>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] text-[#D4AF37] mb-4 uppercase">ACADEMY</p>
            <button onClick={() => document.getElementById('why-hama')?.scrollIntoView({ behavior: 'smooth' })} className="block mb-2 text-[12px] text-[#3a3828] hover:text-[#D4AF37]">Game da Mu</button>
            <button onClick={onStart} className="block mb-2 text-[12px] text-[#3a3828] hover:text-[#D4AF37]">Malamanmu</button>
            <button onClick={onStart} className="block mb-2 text-[12px] text-[#3a3828] hover:text-[#D4AF37]">Shaida</button>
            <button onClick={() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })} className="block text-[12px] text-[#3a3828] hover:text-[#D4AF37]">Tuntuba</button>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] text-[#D4AF37] mb-4 uppercase">TALLAFI</p>
            <Link to="/login" className="block mb-2 text-[12px] text-[#3a3828] hover:text-[#D4AF37]">Tambayoyi</Link>
            <Link to="/login" className="block mb-2 text-[12px] text-[#3a3828] hover:text-[#D4AF37]">Sharuɗɗa</Link>
            <Link to="/login" className="block mb-2 text-[12px] text-[#3a3828] hover:text-[#D4AF37]">Sirri</Link>
            <button className="block text-[12px] text-[#3a3828] hover:text-[#D4AF37]">Hausa · English</button>
          </div>
        </div>

        <div className="mt-8 border-t border-[#1e1c12] pt-6 flex justify-between items-center">
          <p className="text-[11px] text-[#2a2820] tracking-[0.1em]">{t('footer.copyright')}</p>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-[#1a1810] border border-[#2a2820]" />
            <span className="w-7 h-7 bg-[#1a1810] border border-[#2a2820]" />
            <span className="w-7 h-7 bg-[#1a1810] border border-[#2a2820]" />
          </div>
        </div>
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
    <div className="relative min-h-screen bg-[#0a0a08] text-[#F5F5DC] overflow-x-clip">
      <div className="noise" />

      <div className="relative z-10">
        <LandingNavbar onStart={startLearning} onBrowse={browseCourses} />
        <HeroSection
          onStart={startLearning}
          onBrowse={browseCourses}
          courses={featuredCourses}
          onOpenPreview={(title, videoId) => setActivePreview({ title, videoId })}
          onOpenCourse={openCourseFromCard}
        />
        <TrustStrip />
        <FeaturedCourses
          courses={featuredCourses}
          onBrowse={browseCourses}
          onOpenPreview={(title, videoId) => setActivePreview({ title, videoId })}
          onOpenCourse={openCourseFromCard}
        />
        <WhyHama />
        <PlatformFeatures courses={featuredCourses} />
        <Testimonials />
        <CtaModule onStart={startLearning} onBrowse={browseCourses} />
        <Footer onBrowse={browseCourses} onStart={startLearning} />
      </div>

      {activePreview && (
        <div
          className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.85)] backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActivePreview(null)}
          role="dialog"
          aria-modal="true"
          aria-label={t('catalog.preview_modal_title')}
        >
          <div
            className="w-full max-w-4xl border border-[#2a2820] bg-[#0d0c09] overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-[#1e1c12]">
              <p className="text-sm md:text-base font-bold text-[#F5F5DC] break-words pr-4">{activePreview.title}</p>
              <button
                type="button"
                ref={closeButtonRef}
                onClick={() => setActivePreview(null)}
                className="p-2 border border-[#2a2820] text-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
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
