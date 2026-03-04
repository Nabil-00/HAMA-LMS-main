import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course, Module, Lesson, ContentType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getCourses } from '../services/courseService';
import { getUserEnrollments, enrollUser, createPayment, verifyPayment, getPaymentByReference } from '../services/userService';
import { initializePaystack, loadPaystackScript } from '../services/paystackService';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  User,
  Eye,
  ChevronRight,
  Video,
  FileText,
  CheckSquare,
  Globe,
  Mic,
  Box,
  MonitorPlay,
  Code,
  Gamepad2,
  PlayCircle,
  Maximize2,
  Minimize2,
  ArrowLeft,
  PenTool,
  Lock
} from 'lucide-react';

// --- COURSE PLAYER (Formerly Viewer) ---
const CourseViewerModal = ({ course, onClose }: { course: Course; onClose: () => void }) => {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(course.modules[0]?.id || null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-close sidebar on mobile when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-select first lesson if available and nothing selected
  useEffect(() => {
    if (!activeLessonId && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      setActiveLessonId(course.modules[0].lessons[0].id);
    }
  }, [course]);

  // Scroll to top when lesson changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeLessonId]);

  // Flatten lessons for navigation
  const allLessons = course.modules.flatMap((m: Module) => m.lessons.map((l: Lesson) => ({ ...l, moduleId: m.id })));
  const activeLesson = allLessons.find((l: any) => l.id === activeLessonId);
  const currentIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);
  const nextLesson = allLessons[currentIndex + 1];

  const getIconForType = (type: ContentType) => {
    switch (type) {
      case ContentType.VIDEO_VOD: return <Video size={14} />;
      case ContentType.VIDEO_LIVE: return <MonitorPlay size={14} />;
      case ContentType.AUDIO_PODCAST: return <Mic size={14} />;
      case ContentType.VR_AR: return <Box size={14} />;
      case ContentType.SCORM_HTML5: return <Globe size={14} />;
      case ContentType.SIMULATION: return <Gamepad2 size={14} />;
      case ContentType.QUIZ: return <CheckSquare size={14} />;
      case ContentType.EMBED: return <Code size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const renderLessonContent = (lesson: Lesson) => {
    // Basic renderer based on type
    if (lesson.type === ContentType.VIDEO_VOD || lesson.type === ContentType.VIDEO_LIVE) {
      return (
        <div className="space-y-6 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
          <div className="aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden flex items-center justify-center relative shadow-2xl ring-1 ring-white/10 group">
            {lesson.metadata.streamUrl ? (
              <div className="text-text-primary flex flex-col items-center gap-4 md:gap-6">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-hama-gold rounded-full flex items-center justify-center text-black shadow-2xl transform group-hover:scale-110 transition-transform cursor-pointer">
                  <PlayCircle className="w-[32px] h-[32px] md:w-[48px] md:h-[48px]" fill="currentColor" />
                </div>
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-hama-gold/60">Now Playing</p>
              </div>
            ) : (
              <div className="text-text-primary/20 flex flex-col items-center gap-4">
                <Video className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] opacity-10" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-text-muted">No Video</span>
              </div>
            )}
          </div>
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hama-gold/10 border border-hama-gold/20 text-hama-gold text-[8px] md:text-[9px] font-black uppercase tracking-widest">
              Audio Production Series
            </div>
            <h1 className="text-2xl md:text-6xl font-black text-text-primary serif tracking-tight">{lesson.title}</h1>
            <div className="text-sm md:text-lg text-text-secondary leading-relaxed font-light">
              {lesson.content || "Deep silence accompanies this module. Insights pending."}
            </div>
          </div>
        </div>
      );
    }

    if (lesson.type === ContentType.EMBED) {
      return (
        <div className="space-y-6 md:space-y-12 animate-in fade-in duration-700 max-w-6xl mx-auto">
          {lesson.metadata.embedCode ? (
            <div className="aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10" dangerouslySetInnerHTML={{ __html: lesson.metadata.embedCode }} />
          ) : (
            <div className="aspect-video bg-white/5 rounded-2xl md:rounded-3xl flex items-center justify-center text-text-primary/20 border border-dashed border-white/10">
              <Code className="w-[48px] h-[48px] md:w-[64px] md:h-[64px]" />
            </div>
          )}
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
            <h1 className="text-2xl md:text-4xl font-bold text-text-primary serif">{lesson.title}</h1>
            <div className="text-sm md:text-lg text-text-secondary leading-relaxed font-light">
              {lesson.content}
            </div>
          </div>
        </div>
      );
    }

    // Default / Text / Audio / etc
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-3 md:gap-4 text-hama-gold mb-6 md:mb-12">
          <span className="p-2 md:p-3 bg-hama-gold/10 border border-hama-gold/20 rounded-xl md:rounded-2xl">
            {getIconForType(lesson.type)}
          </span>
          <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-hama-gold">{lesson.type.replace('_', ' ')}</span>
        </div>

        <h1 className="text-3xl md:text-7xl font-black text-text-primary mb-6 md:mb-12 serif leading-tight">
          {lesson.title}
        </h1>

        <div className="text-base md:text-xl text-text-secondary leading-relaxed font-light space-y-4 md:space-y-6">
          {lesson.content ? (
            <div className="whitespace-pre-wrap font-sans">{lesson.content}</div>
          ) : (
            <div className="p-10 md:p-20 text-center bento-card border-dashed border-white/10 text-text-muted bg-transparent">
              <FileText size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest">No content yet</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-bg-primary flex flex-col animate-in slide-in-from-bottom-8 duration-500 overflow-hidden text-text-primary selection:bg-hama-gold selection:text-black backdrop-blur-3xl">
      {/* Background visual layers */}
      <div className="noise" />
      <div className="aura" style={{ top: '-10%', right: '-10%' }} />
      <div className="aura" style={{ bottom: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(242, 201, 76, 0.05) 0%, transparent 70%)' }} />

      {/* Viewer Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 py-4 md:py-6 glass shrink-0 z-20 md:z-30 border-b border-hama-gold/10 gap-4">
        <div className="flex items-center gap-6">
          <button
            onClick={onClose}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-hama-gold hover:text-black transition-all text-hama-gold"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h3 className="text-lg md:text-4xl font-bold text-hama-gold serif italic truncate">
              {course.title}
            </h3>
            <p className="text-[8px] md:text-[10px] text-text-muted flex items-center gap-2 md:gap-4 font-black uppercase tracking-[0.2em] mt-1">
              <span className="flex items-center gap-1 md:gap-2"><User size={10} className="text-hama-gold" /> {course.author || 'Author'}</span>
              <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white/10 rounded-full"></span>
              <span className="text-hama-gold">HAMA Studio</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex items-center gap-3 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-hama-gold transition-colors bento-card bg-transparent border-hama-gold/10"
          >
            {sidebarOpen ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            {sidebarOpen ? 'Focus Mode' : 'Course View'}
          </button>
          <div className="h-8 w-px bg-white/5 mx-2 hidden md:block"></div>
          <button
            onClick={onClose}
            className="px-6 md:px-8 py-2 md:py-3 bg-hama-gold text-black font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] rounded-xl md:rounded-2xl hover:bg-text-primary transition-all shadow-xl shadow-hama-gold/10"
          >
            Close
          </button>
        </div>
      </div>

      {/* Viewer Body */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar: Syllabus */}
        {sidebarOpen && (
          <div className="fixed md:relative inset-y-0 left-0 w-full sm:w-80 md:w-96 glass border-r border-hama-gold/10 overflow-y-auto flex flex-col transition-all duration-300 z-50 md:z-10 h-full md:h-auto">
            <div className="p-6 md:p-8 border-b border-hama-gold/5 flex items-center justify-between md:block">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <h3 className="text-[9px] md:text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Module Map</h3>
                  <span className="text-[8px] md:text-[9px] font-black text-hama-gold bg-hama-gold/10 px-2 py-0.5 rounded-full border border-hama-gold/20 uppercase tracking-widest">
                    {course.modules.reduce((acc: number, m: Module) => acc + m.lessons.length, 0)} Lessons
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden hidden md:block">
                  <div className="h-full bg-hama-gold w-1/3 shadow-[0_0_10px_rgba(242,201,76,0.5)]"></div>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 text-text-muted hover:text-hama-gold"
              >
                <Minimize2 size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {course.modules.map((module: Module) => (
                <div key={module.id} className="bento-card border-hama-gold/5 overflow-hidden">
                  <button
                    onClick={() => setActiveModuleId(activeModuleId === module.id ? null : module.id)}
                    className="w-full text-left px-5 py-5 text-[11px] font-bold text-text-primary flex items-center justify-between hover:bg-white/5 transition-colors uppercase tracking-[0.1em] serif relative z-10"
                  >
                    {module.title}
                    <ChevronRight size={14} className={`text-hama-gold transform transition-transform ${activeModuleId === module.id ? 'rotate-90' : ''}`} />
                  </button>

                  {activeModuleId === module.id && (
                    <div className="border-t border-hama-gold/5 bg-black/20 relative z-10">
                      {module.lessons.map((lesson: Lesson) => (
                        <div
                          key={lesson.id}
                          onClick={() => setActiveLessonId(lesson.id)}
                          className={`px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-4 cursor-pointer transition-all border-l-4 ${activeLessonId === lesson.id
                            ? 'bg-hama-gold/10 text-hama-gold border-hama-gold'
                            : 'border-transparent text-text-muted hover:bg-white/5 hover:text-text-secondary'
                            }`}
                        >
                          <div className={`${activeLessonId === lesson.id ? 'text-hama-gold' : 'text-white/10'}`}>
                            {getIconForType(lesson.type)}
                          </div>
                          <span className="truncate flex-1">{lesson.title}</span>
                          <span className="text-[9px] opacity-40 font-mono">{lesson.durationMinutes}m</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-20 scroll-smooth bg-transparent">
          {activeLesson ? (
            <div className="pb-32">
              {renderLessonContent(activeLesson)}

              {nextLesson && (
                <div className={`mx-auto mt-24 flex justify-end ${(activeLesson.type === ContentType.VIDEO_VOD || activeLesson.type === ContentType.VIDEO_LIVE || activeLesson.type === ContentType.EMBED)
                  ? 'max-w-6xl'
                  : 'max-w-4xl'
                  }`}>
                  <button
                    onClick={() => {
                      setActiveLessonId(nextLesson.id);
                      setActiveModuleId(nextLesson.moduleId);
                    }}
                    className="group flex items-center gap-6 px-8 py-6 bento-card border-hama-gold/10 hover:border-hama-gold/30 hover:translate-x-2 transition-all p-8"
                  >
                    <div className="flex flex-col items-end relative z-10">
                      <span className="text-[10px] font-black text-hama-gold/40 uppercase tracking-[0.4em] mb-2">Next</span>
                      <span className="text-xl font-bold text-text-primary serif group-hover:text-hama-gold transition-colors">{nextLesson.title}</span>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-hama-gold/10 border border-hama-gold/20 flex items-center justify-center text-hama-gold group-hover:bg-hama-gold group-hover:text-black transition-all relative z-10">
                      <ChevronRight size={24} />
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
              <div className="w-24 h-24 bg-hama-gold/10 border border-hama-gold/20 rounded-3xl flex items-center justify-center mb-10 rotate-3 animate-in zoom-in duration-1000">
                <BookOpen size={48} className="text-hama-gold" />
              </div>
              <h3 className="text-4xl font-bold text-text-primary mb-4 serif">Barka, Virtuoso.</h3>
              <p className="text-lg text-text-secondary font-light leading-relaxed">
                Pick a lesson to start learning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COURSE LIST COMPONENT ---
const CourseList: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<string[]>([]); // Array of courseIds
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    loadPaystackScript().catch(console.error);
    loadCourses();
  }, []);

  useEffect(() => {
    if (user) {
      loadEnrollments();
    }
  }, [user]);

  const loadCourses = async () => {
    const fetchedCourses = await getCourses();
    setCourses(fetchedCourses);
  };

  const loadEnrollments = async () => {
    if (!user) return;
    const fetched = await getUserEnrollments(user.id);
    setEnrollments(fetched.map(e => e.courseId));
  };

  const handleStartCourse = async (course: Course) => {
    // 1. Check if allowed by role
    if (hasRole(['Admin', 'Teacher'])) {
      setSelectedCourse(course);
      return;
    }

    // 2. Check if free
    if (course.isFree) {
      setSelectedCourse(course);
      return;
    }

    // 3. Check if already enrolled
    if (enrollments.includes(course.id)) {
      setSelectedCourse(course);
      return;
    }

    // 4. Trigger Paystack
    const publicKey = (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey || publicKey === 'pk_test_placeholder') {
      alert("Payment system is being configured. Please contact admin.");
      return;
    }

    // Generate a unique reference for this payment
    const paymentReference = `HAMA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    setIsProcessingPayment(true);

    // Create payment record first
    try {
      await createPayment(user!.id, course.id, course.price, paymentReference);
    } catch (e) {
      console.error("Failed to create payment record:", e);
      // Continue anyway - we'll verify on callback
    }

    initializePaystack({
      key: publicKey,
      email: user?.email || '',
      amount: course.price,
      metadata: {
        courseId: course.id,
        userId: user?.id || '',
        reference: paymentReference
      },
      onSuccess: async (res) => {
        try {
          // Verify payment and enroll
          const result = await verifyPayment(paymentReference, res);
          if (result) {
            await loadEnrollments();
            setSelectedCourse(course);
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        } catch (e) {
          console.error("Enrollment failed", e);
          alert("Enrollment failed. Please contact support.");
        } finally {
          setIsProcessingPayment(false);
        }
      },
      onCancel: () => {
        setIsProcessingPayment(false);
      }
    });
  };

  const filteredCourses = courses.filter((c: Course) =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.author || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 -mx-4 md:mx-0 px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="w-full">
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-hama-gold/5 border border-hama-gold/10 text-hama-gold text-[9px] font-bold uppercase tracking-[0.3em] mb-3">
            Kayayyakin Darussa
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold serif text-text-primary">Bincika Darussa</h1>
          <p className="text-text-secondary mt-2 md:mt-4 text-sm md:text-base leading-relaxed font-light">Koyi yin kiɗa daga malaman kiɗa.</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-hama-gold transition-colors" size={14} />
            <input
              type="text"
              placeholder="Bincika..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-9 md:pl-12 pr-3 md:pr-6 py-2.5 md:py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-bold uppercase tracking-wider md:tracking-widest text-text-primary focus:ring-1 focus:ring-hama-gold/30 outline-none w-full md:w-56 lg:w-72 placeholder:text-text-muted transition-all"
            />
          </div>
          <button className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2.5 md:py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-hama-gold hover:bg-white/10 transition-all">
            <Filter size={14} /> <span className="hidden sm:inline">Zaɓe</span>
          </button>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 md:py-32 bento-card border-dashed border-white/10 bg-transparent">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10">
            <BookOpen size={40} className="text-white/10" />
          </div>
          <h3 className="text-2xl font-bold serif text-text-secondary italic relative z-10">Ba a samo ba</h3>
          <p className="text-text-muted max-w-sm mx-auto mt-4 text-sm font-light relative z-10">
            Ba a sami darussa ba. Gwada bincike ko bincika duk darussa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {filteredCourses.map((course: Course) => (
            <div key={course.id} className="group bento-card bg-transparent overflow-hidden hover:border-hama-gold/20 hover:-translate-y-2 transition-all duration-500 flex flex-col h-full">
              {/* Thumbnail Area */}
              <div className="h-40 sm:h-48 md:h-56 bg-black relative overflow-hidden">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-70" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/5 bg-gradient-to-br from-white/5 to-transparent">
                    <BookOpen size={64} />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent opacity-90" />

                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-black/50 backdrop-blur-md border border-white/10 text-text-secondary text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em]">
                    v{course.currentVersion}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 z-10">
                  <div className="flex flex-col gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${course.status === 'Published'
                      ? 'bg-hama-gold text-black border-hama-gold'
                      : 'bg-white/5 text-text-secondary border-white/10'
                      }`}>
                      {course.status}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${course.isFree
                      ? 'bg-white/10 text-text-muted border-white/10'
                      : 'bg-hama-gold/20 text-hama-gold border-hama-gold/30'
                      }`}>
                      {course.isFree ? 'Free Access' : `₦${course.price?.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 md:p-8 flex-1 flex flex-col relative z-10">
                <div className="flex items-center text-[9px] font-black text-text-muted gap-3 uppercase tracking-[0.3em] mb-4">
                  <Clock size={12} />
                  {new Date(course.lastModified).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                <h3 className="font-bold text-lg md:text-2xl text-hama-gold mb-1 md:mb-4 serif leading-tight group-hover:text-hama-gold transition-colors line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-[9px] md:text-sm text-text-secondary mb-2 md:mb-8 line-clamp-2 leading-relaxed font-light flex-1">
                  {course.description || "Learn the professional production techniques used by top Nigerian artists in this comprehensive HAMA masterclass."}
                </p>

                <div className="flex items-center justify-between pt-4 md:pt-8 border-t border-white/5 mt-auto">
                  <div className="hidden sm:flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center text-[11px] font-black text-hama-gold">
                      {(course.author || 'H').charAt(0)}
                    </div>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest truncate">{course.author || 'Author'}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {hasRole(['Admin', 'Teacher']) && (
                      <button
                        onClick={() => navigate(`/create?courseId=${course.id}`)}
                        className="p-3 bg-white/5 border border-white/10 text-text-muted hover:text-hama-gold hover:border-hama-gold/30 rounded-xl transition-all"
                        title="Edit Course"
                      >
                        <PenTool size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => handleStartCourse(course)}
                      disabled={isProcessingPayment}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-3 py-2 md:py-2.5 bg-hama-gold text-black text-[10px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-lg md:rounded-xl hover:bg-text-primary transition-all shadow-xl shadow-hama-gold/10 disabled:opacity-50"
                    >
                      <PlayCircle size={14} className="shrink-0" />
                      <span>
                        {isProcessingPayment
                          ? 'Aiki...'
                          : (enrollments.includes(course.id) || course.isFree || hasRole(['Admin', 'Teacher']))
                            ? 'Fara'
                            : 'Yi oda'
                        }
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCourse && (
        <CourseViewerModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}
    </div>
  );
};

export default CourseList;