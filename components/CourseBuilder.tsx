import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Course, CourseStatus, Module, Lesson, ContentType, ContentMetadata, LocalizedContent, VersionType, CourseVersion } from '../types';
import { createVersionSnapshot, restoreVersion, logAction } from '../services/versioningService';
import { getCourses, saveCourse } from '../services/courseService';
import {
    Save,
    Plus,
    GripVertical,
    FileText,
    Video,
    CheckSquare,
    ChevronDown,
    ChevronRight,
    MoreVertical,
    ArrowLeft,
    PenTool,
    Mic,
    Box,
    Globe,
    MonitorPlay,
    Gamepad2,
    Settings,
    Download,
    ShieldCheck,
    History,
    GitCommit,
    Code,
    ListChecks,
    Lock,
    UploadCloud,
    Clock,
    Trash2,
    Copy,
    ChevronUp,
    X
} from 'lucide-react';
import TranslationManager from './TranslationManager';
import VersionControlPanel from './VersionControlPanel';
import { VideoEditor, AudioEditor, ImmersiveEditor, ScormEditor, EmbedEditor } from './ContentEditors';
import { useToast } from './Toast';
import OrientationPrompt from './OrientationPrompt';

const RTL_LOCALES = ['ar-SA', 'he-IL', 'fa-IR', 'ur-PK'];

const CourseBuilder: React.FC = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize state lazily to handle loading existing course
    const [course, setCourse] = useState<Course>({
        id: 'new',
        title: 'Untitled Course',
        description: '',
        thumbnailUrl: '',
        author: 'Admin User',
        status: CourseStatus.DRAFT,
        lastModified: new Date().toISOString(),
        modules: [],
        tags: [],
        defaultLocale: 'en-US',
        supportedLocales: ['en-US'],
        localizations: {},
        currentVersion: '0.0.1',
        versions: [],
        auditLog: [],
        price: 0,
        isFree: true
    });

    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [showVersionPanel, setShowVersionPanel] = useState(false);
    const [showLessonEditor, setShowLessonEditor] = useState(false);

    useEffect(() => {
        const loadInitialCourse = async () => {
            const courseId = searchParams.get('courseId');
            if (courseId && courseId !== 'new') {
                try {
                    const courses = await getCourses();
                    const found = courses.find(c => c.id === courseId);
                    if (found) setCourse(found);
                } catch (e) {
                    console.error("Failed to load course", e);
                }
            }
        };
        loadInitialCourse();
    }, [searchParams]);

    // Auto-close sidebar on mobile when window resizes
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 1024) setSidebarOpen(false);
            else setSidebarOpen(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-create module and lesson for new courses
    useEffect(() => {
        if (course.modules.length === 0) {
            const newModule: Module = {
                id: `mod-${Date.now()}`,
                title: 'Module 1',
                lessons: [],
                localizations: {}
            };
            setCourse({ ...course, modules: [newModule] });
            setActiveModuleId(newModule.id);
        }
    }, []);

    // Auto-select first lesson when module is selected
    useEffect(() => {
        if (activeModuleId) {
            const module = course.modules.find((m: Module) => m.id === activeModuleId);
            if (module && module.lessons.length > 0 && !activeLessonId) {
                setActiveLessonId(module.lessons[0].id);
            }
        }
    }, [activeModuleId, course.modules]);

    // Auto-create first lesson when module has no lessons
    useEffect(() => {
        if (activeModuleId && course.modules.length > 0) {
            const module = course.modules.find((m: Module) => m.id === activeModuleId);
            if (module && module.lessons.length === 0) {
                const newLesson: Lesson = {
                    id: `less-${Date.now()}`,
                    title: 'Lesson 1',
                    type: ContentType.TEXT,
                    durationMinutes: 10,
                    content: '',
                    metadata: {},
                    localizations: {},
                    prerequisiteIds: []
                };
                const updatedModules = course.modules.map((m: Module) => {
                    if (m.id === activeModuleId) {
                        return { ...m, lessons: [newLesson] };
                    }
                    return m;
                });
                setCourse({ ...course, modules: updatedModules });
                setActiveLessonId(newLesson.id);
            }
        }
    }, [activeModuleId, course.modules]);

    const [viewMode, setViewMode] = useState<'curriculum' | 'settings'>('curriculum');
    const [isUploading, setIsUploading] = useState(false);

    // Localization State
    const [currentLocale, setCurrentLocale] = useState('en-US');
    const isDefaultLocale = currentLocale === course.defaultLocale;
    const isRTL = RTL_LOCALES.includes(currentLocale);

    // STRICT THEME CLASS DEFINITIONS
    const inputBaseClass = "bg-white/5 text-text-primary border-white/10 placeholder-text-muted focus:border-hama-gold/30";
    const transparentInputClass = "bg-transparent text-text-primary placeholder:text-text-muted"; // Inline fields must also have background

    // Helper to get localized value
    const getLocalized = (entity: any, field: string) => {
        if (isDefaultLocale) return entity[field];
        return entity.localizations?.[currentLocale]?.[field] || '';
    };

    // Helper to set localized value
    const setLocalized = (entity: any, field: string, value: string) => {
        if (isDefaultLocale) {
            return { ...entity, [field]: value };
        }
        const currentLoc = entity.localizations || {};
        return {
            ...entity,
            localizations: {
                ...currentLoc,
                [currentLocale]: {
                    ...(currentLoc[currentLocale] || {}),
                    [field]: value
                }
            }
        };
    };

    // Computed active lesson with localization helpers
    const activeLesson = (course.modules || [])
        .flatMap((m: Module) => m.lessons || [])
        .find((l: Lesson) => l.id === activeLessonId);

    // Handlers
    const addModule = () => {
        const newModule: Module = {
            id: `mod-${Date.now()}`,
            title: 'New Module',
            lessons: [],
            localizations: {}
        };
        setCourse({ ...course, modules: [...course.modules, newModule] });
        setActiveModuleId(newModule.id);
        addToast("Module initialized.", 'success');
    };

    const deleteModule = (moduleId: string) => {
        if (!window.confirm("Are you sure you want to delete this module and all its lessons? This cannot be undone.")) return;
        setCourse({
            ...course,
            modules: course.modules.filter((m: Module) => m.id !== moduleId)
        });
        if (activeModuleId === moduleId) setActiveModuleId(null);
        addToast("Module removed.", 'info');
    };

    const addLesson = (moduleId: string) => {
        const newLesson: Lesson = {
            id: `less-${Date.now()}`,
            title: 'New Lesson',
            type: ContentType.TEXT,
            durationMinutes: 10,
            content: '',
            metadata: {},
            localizations: {},
            prerequisiteIds: []
        };

        const updatedModules = course.modules.map((m: Module) => {
            if (m.id === moduleId) {
                return { ...m, lessons: [...m.lessons, newLesson] };
            }
            return m;
        });

        setCourse({ ...course, modules: updatedModules });
        setActiveLessonId(newLesson.id);
        addToast("Lesson segment added.", 'success');
    };

    const deleteLesson = (moduleId: string, lessonId: string) => {
        const updatedModules = course.modules.map((m: Module) => {
            if (m.id === moduleId) {
                return { ...m, lessons: m.lessons.filter((l: Lesson) => l.id !== lessonId) };
            }
            return m;
        });
        setCourse({ ...course, modules: updatedModules });
        if (activeLessonId === lessonId) setActiveLessonId(null);
        addToast("Lesson removed.", 'info');
    };

    const duplicateLesson = (moduleId: string, lessonId: string) => {
        const module = course.modules.find(m => m.id === moduleId);
        const lessonToCopy = module?.lessons.find(l => l.id === lessonId);
        if (!lessonToCopy) return;

        const newLesson: Lesson = {
            ...JSON.parse(JSON.stringify(lessonToCopy)),
            id: `less-${Date.now()}`,
            title: `${lessonToCopy.title} (Copy)`
        };

        const updatedModules = course.modules.map((m: Module) => {
            if (m.id === moduleId) {
                return { ...m, lessons: [...m.lessons, newLesson] };
            }
            return m;
        });

        setCourse({ ...course, modules: updatedModules });
        setActiveLessonId(newLesson.id);
        addToast("Lesson duplicated.", 'success');
    };

    const updateLesson = (updates: Partial<Lesson> | any) => {
        if (!activeLessonId) return;
        const updatedModules = course.modules.map((m: Module) => ({
            ...m,
            lessons: m.lessons.map((l: Lesson) => l.id === activeLessonId ? { ...l, ...updates } : l)
        }));
        setCourse({ ...course, modules: updatedModules });
    };

    const togglePrerequisite = (prerequisiteId: string) => {
        if (!activeLesson) return;
        const currentPrereqs = activeLesson.prerequisiteIds || [];
        let newPrereqs;

        if (currentPrereqs.includes(prerequisiteId)) {
            newPrereqs = currentPrereqs.filter((id: string) => id !== prerequisiteId);
        } else {
            newPrereqs = [...currentPrereqs, prerequisiteId];
        }

        updateLesson({ prerequisiteIds: newPrereqs });
    };

    // Wrapper to update localized lesson fields
    const updateLessonField = (field: string, value: string) => {
        if (!activeLesson) return;
        const updatedLesson = setLocalized(activeLesson, field, value);
        updateLesson(updatedLesson);
    }

    // Wrapper to update localized course fields
    const updateCourseField = (field: string, value: string) => {
        const updatedCourse = setLocalized(course, field, value);
        setCourse(updatedCourse);
    }

    // Wrapper to update localized module fields
    const updateModuleField = (moduleId: string, field: string, value: string) => {
        const updatedModules = course.modules.map((m: Module) => {
            if (m.id === moduleId) {
                return setLocalized(m, field, value);
            }
            return m;
        });
        setCourse({ ...course, modules: updatedModules });
    }

    const moveModule = (moduleId: string, direction: 'up' | 'down') => {
        const index = course.modules.findIndex(m => m.id === moduleId);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === course.modules.length - 1) return;

        const newModules = [...course.modules];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newModules[index], newModules[newIndex]] = [newModules[newIndex], newModules[index]];

        setCourse({ ...course, modules: newModules });
        addToast("Module reordered.", 'info');
    };

    const moveLesson = (moduleId: string, lessonId: string, direction: 'up' | 'down') => {
        const updatedModules = course.modules.map((m: Module) => {
            if (m.id === moduleId) {
                const index = m.lessons.findIndex(l => l.id === lessonId);
                if (index === -1) return m;
                if (direction === 'up' && index === 0) return m;
                if (direction === 'down' && index === m.lessons.length - 1) return m;

                const newLessons = [...m.lessons];
                const newIndex = direction === 'up' ? index - 1 : index + 1;
                [newLessons[index], newLessons[newIndex]] = [newLessons[newIndex], newLessons[index]];

                return { ...m, lessons: newLessons };
            }
            return m;
        });
        setCourse({ ...course, modules: updatedModules });
        addToast("Lesson reordered.", 'info');
    };

    const addTag = (tag: string) => {
        if (!tag || course.tags.includes(tag)) return;
        setCourse({ ...course, tags: [...course.tags, tag] });
    };

    const removeTag = (tagToRemove: string) => {
        setCourse({ ...course, tags: course.tags.filter(t => t !== tagToRemove) });
    };

    // --- ASSET UPLOAD HANDLER ---
    const handleAssetUpload = async (file: File, target: 'thumbnail' | 'lesson-media') => {
        setIsUploading(true);
        try {
            const { uploadAsset } = await import('../services/courseService');
            const publicUrl = await uploadAsset(file);

            if (target === 'thumbnail') {
                setCourse({ ...course, thumbnailUrl: publicUrl });
                addToast("Thumbnail uploaded.", 'success');
            } else if (activeLessonId) {
                updateLesson({ metadata: { ...activeLesson?.metadata, streamUrl: publicUrl } });
                addToast("Media asset uploaded.", 'success');
            }
        } catch (e: any) {
            addToast(`Upload failed: ${e.message}`, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    // --- VERSION CONTROL HANDLERS ---
    const handlePublish = async (type: VersionType, notes: string) => {
        // Ensure ID is stable before publishing
        let courseToProcess = { ...course };
        if (courseToProcess.id === 'new') {
            courseToProcess.id = crypto.randomUUID();
            setSearchParams({ courseId: courseToProcess.id });
        }

        const newCourseState = createVersionSnapshot(courseToProcess, type, notes, 'Admin User');

        try {
            await saveCourse(newCourseState);
            setCourse(newCourseState);
            setShowVersionPanel(false);
            addToast(`Successfully published version ${newCourseState.currentVersion}.`, 'success');
        } catch (e: any) {
            console.error("Failed to save to Supabase", e);
            addToast(`Publish failed: ${e.message}`, 'error');
        }
    };

    const handleRestore = (version: CourseVersion) => {
        const restoredCourse = restoreVersion(course, version, 'Admin User');
        setCourse(restoredCourse);
        setShowVersionPanel(false);
        // Reset active selection in case IDs changed or items were removed in old version
        setActiveModuleId(null);
        setActiveLessonId(null);
        addToast(`Restored course to version ${version.version}`, 'info');
    };

    const handleSaveDraft = async () => {
        let courseToSave = { ...course };
        if (courseToSave.id === 'new') {
            courseToSave.id = crypto.randomUUID();
            setSearchParams({ courseId: courseToSave.id });
        }

        courseToSave = logAction(courseToSave, 'SAVE_DRAFT', 'Manual draft save triggered', 'Admin User');
        courseToSave.lastModified = new Date().toISOString();

        try {
            await saveCourse(courseToSave);
            setCourse(courseToSave);
            addToast("Draft saved successfully.", 'success');
        } catch (e: any) {
            console.error("Failed to save draft", e);
            addToast(`Failed to save draft: ${e.message}`, 'error');
        }
    };

    const getIconForType = (type: ContentType, size = 14) => {
        switch (type) {
            case ContentType.VIDEO_VOD: return <Video size={size} />;
            case ContentType.VIDEO_LIVE: return <MonitorPlay size={size} />;
            case ContentType.AUDIO_PODCAST: return <Mic size={size} />;
            case ContentType.VR_AR: return <Box size={size} />;
            case ContentType.SCORM_HTML5: return <Globe size={size} />;
            case ContentType.SIMULATION: return <Gamepad2 size={size} />;
            case ContentType.QUIZ: return <CheckSquare size={size} />;
            case ContentType.EMBED: return <Code size={size} />;
            default: return <FileText size={size} />;
        }
    }

    const renderContentEditor = () => {
        if (!activeLesson) return null;

        const commonProps = {
            metadata: activeLesson.metadata,
            onChange: (metadata: ContentMetadata) => updateLesson({ metadata }),
            content: getLocalized(activeLesson, 'content'),
            onContentChange: (val: string) => updateLessonField('content', val),
            onUpload: (file: File) => handleAssetUpload(file, 'lesson-media'),
            isUploading: isUploading
        };

        switch (activeLesson.type) {
            case ContentType.VIDEO_VOD:
            case ContentType.VIDEO_LIVE:
                return (
                    <div className="space-y-6">
                        {isDefaultLocale && <VideoEditor {...commonProps} isLive={activeLesson.type === ContentType.VIDEO_LIVE} />}
                        {!isDefaultLocale && <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">Media source is managed in the Default Locale. You can localize the instructions below.</div>}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lesson Instructions ({currentLocale})</label>
                            <textarea
                                dir={isRTL ? 'rtl' : 'ltr'}
                                className={`w-full h-32 p-3 border rounded-lg text-sm ${inputBaseClass}`}
                                value={commonProps.content}
                                onChange={(e) => commonProps.onContentChange(e.target.value)}
                            />
                        </div>
                    </div>
                );
            case ContentType.AUDIO_PODCAST:
                return (
                    <div className="space-y-6">
                        {isDefaultLocale && <AudioEditor {...commonProps} />}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transcript / Notes ({currentLocale})</label>
                            <textarea
                                dir={isRTL ? 'rtl' : 'ltr'}
                                className={`w-full h-32 p-3 border rounded-lg text-sm ${inputBaseClass}`}
                                value={commonProps.content}
                                onChange={(e) => commonProps.onContentChange(e.target.value)}
                            />
                        </div>
                    </div>
                );
            case ContentType.VR_AR:
                return isDefaultLocale ? <ImmersiveEditor {...commonProps} /> : <div className="text-gray-500 italic">VR Configuration is global.</div>;
            case ContentType.SCORM_HTML5:
                return isDefaultLocale ? <ScormEditor {...commonProps} /> : <div className="text-gray-500 italic">SCORM Packages are global.</div>;
            case ContentType.EMBED:
                return isDefaultLocale ? <EmbedEditor {...commonProps} /> : <div className="text-gray-500 italic">Embed Code is global.</div>;
            default:
                return (
                    <div className="min-h-[400px] space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rich Text Content ({currentLocale})</label>
                        </div>
                        <textarea
                            dir={isRTL ? 'rtl' : 'ltr'}
                            className={`w-full h-96 p-4 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none font-mono text-sm leading-relaxed ${inputBaseClass} ${isRTL ? 'text-right' : 'text-left'}`}
                            value={activeLesson.content ? getLocalized(activeLesson, 'content') : ''}
                            onChange={(e) => updateLessonField('content', e.target.value)}
                            placeholder={`# Start writing your lesson content in ${currentLocale}...`}
                        ></textarea>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)] glass rounded-2xl md:rounded-3xl overflow-hidden border border-hama-gold/10 shadow-glass animate-in fade-in duration-700">
            <OrientationPrompt />

            {/* Localization Integration */}
            <TranslationManager
                supportedLocales={course.supportedLocales}
                defaultLocale={course.defaultLocale}
                currentLocale={currentLocale}
                onAddLocale={(l) => setCourse({ ...course, supportedLocales: [...course.supportedLocales, l] })}
                onRemoveLocale={(l) => setCourse({ ...course, supportedLocales: course.supportedLocales.filter(sl => sl !== l) })}
                onChangeLocale={setCurrentLocale}
            />

            {/* Builder Header */}
            <div className="flex flex-col md:flex-row h-auto md:h-20 border-b border-hama-gold/5 items-center justify-between px-6 md:px-10 py-4 md:py-0 bg-bg-primary/40 backdrop-blur-md gap-4 z-20 md:z-30">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/courses')}
                        className="p-2 text-white/20 hover:text-gold transition-all bg-white/5 rounded-xl border border-white/5 hover:border-gold/20"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 text-hama-gold bg-hama-gold/10 rounded-xl border border-hama-gold/20 hover:bg-hama-gold/20 transition-all"
                        title="Toggle Structure"
                    >
                        <ListChecks size={20} />
                    </button>
                    <div className="flex flex-col">
                        {/* Strict Input: Course Title */}
                        <input
                            dir={isRTL ? 'rtl' : 'ltr'}
                            value={getLocalized(course, 'title') || ''}
                            onChange={(e) => updateCourseField('title', e.target.value)}
                            placeholder={isDefaultLocale ? "Course Title" : `Course Title (${currentLocale})`}
                            className={`text-[18px] font-black uppercase tracking-[0.3em] focus:outline-none focus:ring-1 focus:ring-gold/30 rounded px-1 -ml-1 ${transparentInputClass}`}
                        />
                        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1 flex items-center gap-3">
                            <button
                                onClick={() => setShowVersionPanel(true)}
                                className="bg-hama-gold/10 text-hama-gold border border-hama-gold/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide flex items-center gap-1 hover:bg-hama-gold/20 transition-all"
                            >
                                <GitCommit size={10} />
                                v{course.currentVersion}
                            </button>
                            <span className="h-1 w-1 bg-white/10 rounded-full"></span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide bg-hama-gold text-black">
                                {course.status}
                            </span>
                            {isDefaultLocale ? <span className="text-text-muted">Default Language</span> : <span className="text-hama-gold/60 font-black">Localized Content</span>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4 w-full md:w-auto mt-2 md:mt-0">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 order-1">
                        <button
                            onClick={() => setViewMode('curriculum')}
                            className={`px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'curriculum' ? 'bg-hama-gold text-black shadow-lg shadow-hama-gold/20' : 'text-text-muted hover:text-white'}`}
                        >
                            Course
                        </button>
                        <button
                            onClick={() => setViewMode('settings')}
                            className={`px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'settings' ? 'bg-hama-gold text-black shadow-lg shadow-hama-gold/20' : 'text-text-muted hover:text-white'}`}
                        >
                            Settings
                        </button>
                    </div>

                    <button
                        onClick={() => setShowVersionPanel(true)}
                        className="hidden md:flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-hama-gold transition-all order-2"
                    >
                        <History size={16} />
                        <span className="hidden lg:inline">History</span>
                    </button>

                    <button
                        onClick={handleSaveDraft}
                        className="flex items-center gap-2 px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-hama-gold transition-all bg-white/5 rounded-xl border border-white/10 order-3"
                    >
                        <Save size={16} />
                        <span className="hidden sm:inline">Save</span>
                    </button>

                    <button
                        onClick={() => setShowVersionPanel(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-4 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-black bg-hama-gold rounded-2xl hover:shadow-[0_0_40px_rgba(242,201,76,0.4)] hover:bg-[#FADC7A] active:scale-95 transition-all pulse-glow order-4"
                    >
                        <UploadCloud size={18} />
                        Publish
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="lg:hidden absolute inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar: Structure - Fixed width on desktop, overlay on mobile */}
                <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'} absolute lg:relative lg:translate-x-0 w-[85vw] sm:w-80 lg:w-96 h-full flex-shrink-0 border-r border-hama-gold/10 bg-bg-primary/95 lg:bg-bg-primary/40 backdrop-blur-xl lg:backdrop-blur-none flex flex-col z-[45] transition-transform duration-300 ease-in-out`}>
                    <div className="p-8 flex justify-between items-center border-b border-white/5 bg-white/2">
                        <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] flex items-center gap-3">
                            <ListChecks size={16} className="text-hama-gold/40" />
                            Course Structure
                        </h3>
                        <div className="flex items-center gap-2">
                            {isDefaultLocale && (
                                <button onClick={addModule} className="p-2 hover:bg-hama-gold/10 rounded-xl text-text-muted hover:text-hama-gold transition-all border border-transparent hover:border-hama-gold/20">
                                    <Plus size={18} />
                                </button>
                            )}
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-2 hover:bg-white/10 rounded-xl text-text-muted hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                        {(course.modules || []).length === 0 && (
                            <div className="text-center py-20 px-8 text-white/10 font-black uppercase tracking-[0.2em] text-[10px] italic">
                                No Modules Yet: Add a Module
                            </div>
                        )}

                        {(course.modules || []).map((module) => (
                            <div key={module.id} className="bento-card bg-white/2 rounded-2xl border border-hama-gold/5 overflow-hidden group/mod transition-all hover:border-hama-gold/20">
                                <div
                                    className={`p-4 flex items-center gap-3 cursor-pointer transition-all relative z-10 ${activeModuleId === module.id ? 'bg-hama-gold/10 border-b border-hama-gold/20' : 'hover:bg-white/5'}`}
                                    onClick={() => setActiveModuleId(activeModuleId === module.id ? null : module.id)}
                                >
                                    <GripVertical size={14} className="text-white/10 cursor-move group-hover/mod:text-hama-gold/40 transition-colors" />
                                    {activeModuleId === module.id ? <ChevronDown size={14} className="text-hama-gold" /> : <ChevronRight size={14} className="text-white/20" />}

                                    {/* Strict Input: Module Title */}
                                    <input
                                        className={`text-[11px] font-black uppercase tracking-widest truncate flex-1 focus:ring-0 p-0 ${transparentInputClass} ${activeModuleId === module.id ? 'text-white' : 'text-white/40'}`}
                                        value={getLocalized(module, 'title') || ''}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => updateModuleField(module.id, 'title', e.target.value)}
                                        dir={isRTL ? 'rtl' : 'ltr'}
                                    />

                                    <div className="flex items-center gap-1 opacity-0 group-hover/mod:opacity-100 transition-all">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveModule(module.id, 'up'); }}
                                            className="p-1 text-white/20 hover:text-hama-gold transition-all"
                                            title="Move Up"
                                        >
                                            <ChevronUp size={12} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveModule(module.id, 'down'); }}
                                            className="p-1 text-white/20 hover:text-hama-gold transition-all"
                                            title="Move Down"
                                        >
                                            <ChevronDown size={12} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteModule(module.id); }}
                                            className="p-1.5 text-white/20 hover:text-red-500 transition-all"
                                            title="Delete Module"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>

                                {activeModuleId === module.id && (
                                    <div className="bg-black/20 animate-in slide-in-from-top-2 duration-300">
                                        <div className="py-2">
                                            {(module.lessons || []).map((lesson) => (
                                                <div
                                                    key={lesson.id}
                                                    onClick={() => { setActiveLessonId(lesson.id); setShowLessonEditor(true); }}
                                                    className={`pl-10 pr-4 py-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest cursor-pointer border-l-2 transition-all group/less ${activeLessonId === lesson.id
                                                        ? 'border-hama-gold bg-hama-gold/5 text-hama-gold shadow-[inset_4px_0_10px_-4px_rgba(242,201,76,1)]'
                                                        : 'border-transparent hover:bg-white/5 text-text-muted hover:text-text-secondary'
                                                        }`}
                                                >
                                                    <div className={`${activeLessonId === lesson.id ? 'text-hama-gold' : 'text-white/10 group-hover/less:text-hama-gold/40'} transition-colors`}>
                                                        {getIconForType(lesson.type)}
                                                    </div>
                                                    <span className="truncate flex-1" dir={isRTL ? 'rtl' : 'ltr'}>
                                                        {getLocalized(lesson, 'title') || lesson.title}
                                                    </span>

                                                    <div className="flex items-center gap-1 opacity-0 group-hover/less:opacity-100 transition-all">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); moveLesson(module.id, lesson.id, 'up'); }}
                                                            className="p-1 text-text-muted hover:text-hama-gold transition-all"
                                                            title="Move Up"
                                                        >
                                                            <ChevronUp size={10} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); moveLesson(module.id, lesson.id, 'down'); }}
                                                            className="p-1 text-text-muted hover:text-hama-gold transition-all"
                                                            title="Move Down"
                                                        >
                                                            <ChevronDown size={10} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); duplicateLesson(module.id, lesson.id); }}
                                                            className="p-1 text-text-muted hover:text-hama-gold transition-all"
                                                            title="Duplicate Lesson"
                                                        >
                                                            <Copy size={12} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteLesson(module.id, lesson.id); }}
                                                            className="p-1 text-text-muted hover:text-red-500 transition-all"
                                                            title="Delete Lesson"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>

                                                    {activeLessonId === lesson.id && (
                                                        <div className="w-1 h-1 bg-hama-gold rounded-full shadow-[0_0_8px_rgba(242,201,76,1)]" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {isDefaultLocale && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); addLesson(module.id); }}
                                                className="w-full text-left pl-10 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-hama-gold/40 hover:text-hama-gold hover:bg-hama-gold/5 transition-all flex items-center gap-2 border-t border-white/5 relative z-10"
                                            >
                                                <Plus size={12} /> Add Lesson
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 bg-black/20 overflow-y-auto scrollbar-none overflow-x-hidden">
                    {viewMode === 'curriculum' && (
                        <div className="max-w-5xl mx-auto py-6 md:py-8 px-4 md:px-8 space-y-6 md:space-y-8">
                            {/* Fast Thumbnail & Meta Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bento-card p-8 border-hama-gold/10">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-hama-gold">Quick Thumbnail</h3>
                                            {course.thumbnailUrl && <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">Active</span>}
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-8 items-start">
                                            <div className="w-full md:w-64 aspect-video bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden flex items-center justify-center relative group shadow-2xl">
                                                {course.thumbnailUrl ? (
                                                    <img src={course.thumbnailUrl} alt="Course Thumbnail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                ) : (
                                                    <UploadCloud size={32} className="text-white/10 group-hover:text-hama-gold/30 transition-colors" />
                                                )}
                                                {isUploading && (
                                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                                                        <div className="w-8 h-8 border-2 border-hama-gold border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-[9px] font-black text-white uppercase tracking-widest text-center">Update Course Visual</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3 w-full md:w-auto">
                                                <label className="flex items-center justify-center gap-3 px-6 py-4 bg-hama-gold/10 hover:bg-hama-gold text-hama-gold hover:text-black border border-hama-gold/20 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95">
                                                    <UploadCloud size={16} />
                                                    {course.thumbnailUrl ? 'Change Art' : 'Select Art'}
                                                    <input
                                                        type="file"
                                                        hidden
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files?.[0] && handleAssetUpload(e.target.files[0], 'thumbnail')}
                                                    />
                                                </label>
                                                {course.thumbnailUrl && (
                                                    <button
                                                        onClick={() => setCourse({ ...course, thumbnailUrl: '' })}
                                                        className="px-6 py-4 bg-white/5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 border border-white/5 hover:border-red-400/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bento-card p-8 border-hama-gold/10 hidden lg:block">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-hama-gold mb-6">Course Stats</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black">
                                            <span className="text-text-muted">Modules</span>
                                            <span className="text-text-primary">{course.modules.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black">
                                            <span className="text-text-muted">Lessons</span>
                                            <span className="text-text-primary">{course.modules.reduce((acc, m) => acc + m.lessons.length, 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black">
                                            <span className="text-text-muted">Duration</span>
                                            <span className="text-text-primary">{course.modules.reduce((acc, m) => acc + m.lessons.reduce((lAcc, l) => lAcc + l.durationMinutes, 0), 0)} min</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewMode === 'settings' ? (
                        /* COURSE SETTINGS VIEW */
                        <div className="max-w-4xl mx-auto py-8 md:py-16 px-4 md:px-12 animate-in fade-in duration-500 space-y-8 md:space-y-12">
                            <div className="bento-card border-hama-gold/10 p-6 md:p-10">
                                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-text-primary mb-8 flex items-center gap-3">
                                    <Settings size={18} className="text-hama-gold" />
                                    Course Settings
                                </h3>

                                <div className="space-y-8">

                                    {/* Description */}
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Course Summary ({currentLocale})</label>
                                        <textarea
                                            className={`w-full h-48 p-6 rounded-3xl text-[13px] leading-relaxed ${inputBaseClass}`}
                                            placeholder="Enter course description..."
                                            value={getLocalized(course, 'description') || ''}
                                            onChange={(e) => updateCourseField('description', e.target.value)}
                                        ></textarea>
                                    </div>

                                    {/* Tags */}
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Course Tags</label>
                                        <div className="flex flex-wrap gap-2 p-4 bg-white/2 border border-white/5 rounded-2xl min-h-[100px]">
                                            {(course.tags || []).map(tag => (
                                                <span key={tag} className="px-4 py-2 bg-hama-gold/10 text-hama-gold border border-hama-gold/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 group">
                                                    {tag}
                                                    <button onClick={() => removeTag(tag)} className="hover:text-white transition-colors">×</button>
                                                </span>
                                            ))}
                                            <input
                                                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-white/40 min-w-[200px]"
                                                placeholder="+ Add Tag..."
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        addTag(e.currentTarget.value);
                                                        e.currentTarget.value = '';
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Monetization */}
                                    {isDefaultLocale && (
                                        <div className="space-y-6 pt-8 border-t border-white/5">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck size={18} className="text-hama-gold" />
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-primary">Monetization</h4>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Course Access</label>
                                                    <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
                                                        <button
                                                            onClick={() => setCourse({ ...course, isFree: true })}
                                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${course.isFree ? 'bg-hama-gold text-black' : 'text-text-muted hover:text-white'}`}
                                                        >
                                                            Free Access
                                                        </button>
                                                        <button
                                                            onClick={() => setCourse({ ...course, isFree: false })}
                                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!course.isFree ? 'bg-hama-gold text-black' : 'text-text-muted hover:text-white'}`}
                                                        >
                                                            Paid Course
                                                        </button>
                                                    </div>
                                                </div>

                                                {!course.isFree && (
                                                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Price (NGN)</label>
                                                        <div className="relative group">
                                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-hama-gold font-black">₦</span>
                                                            <input
                                                                type="number"
                                                                value={course.price || ''}
                                                                onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })}
                                                                className={`w-full pl-12 pr-6 py-4 rounded-2xl text-[14px] font-black ${inputBaseClass}`}
                                                                placeholder="5000"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : activeLesson ? (
                        <div className="max-w-4xl mx-auto py-16 px-12 animate-in fade-in duration-500">
                            {/* Lesson Header Configuration */}
                            <div className="mb-12 space-y-8 bento-card border-hama-gold/10 p-10 hover:border-hama-gold/30 transition-all">
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 bg-hama-gold/10 border border-hama-gold/20 rounded-2xl flex items-center justify-center text-hama-gold">
                                        <PenTool size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-text-primary">Lesson Configuration</h3>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Configure lesson metadata for language: {currentLocale}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div>
                                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3 ml-1">Lesson Title</label>
                                        <input
                                            dir={isRTL ? 'rtl' : 'ltr'}
                                            className={`w-full p-5 glass border border-white/10 rounded-2xl text-[14px] font-black uppercase tracking-[0.1em] text-text-primary focus:ring-1 focus:ring-hama-gold/30 outline-none ${transparentInputClass}`}
                                            placeholder="Enter lesson title..."
                                            value={getLocalized(activeLesson, 'title') || ''}
                                            onChange={(e) => updateLessonField('title', e.target.value)}
                                        />
                                    </div>

                                    {/* Type Selector Grid (Only available in Default Locale) */}
                                    {isDefaultLocale ? (
                                        <div className="mt-8">
                                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4 ml-1">Content Type</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                                                {[
                                                    { type: ContentType.TEXT, label: 'Text', icon: FileText },
                                                    { type: ContentType.VIDEO_VOD, label: 'Video', icon: Video },
                                                    { type: ContentType.VIDEO_LIVE, label: 'Live Stream', icon: MonitorPlay },
                                                    { type: ContentType.AUDIO_PODCAST, label: 'Audio', icon: Mic },
                                                    { type: ContentType.VR_AR, label: 'XR Content', icon: Box },
                                                    { type: ContentType.SCORM_HTML5, label: 'SCORM/HTML5', icon: Globe },
                                                    { type: ContentType.QUIZ, label: 'Assessment', icon: CheckSquare },
                                                    { type: ContentType.EMBED, label: 'Embed', icon: Code },
                                                ].map((item) => {
                                                    const Icon = item.icon;
                                                    const isSelected = activeLesson.type === item.type;
                                                    return (
                                                        <button
                                                            key={item.type}
                                                            onClick={() => updateLesson({ type: item.type as ContentType })}
                                                            className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-500 group relative overflow-hidden ${isSelected
                                                                ? 'bg-hama-gold text-black border-hama-gold shadow-[0_10px_40px_rgba(242,201,76,0.15)]'
                                                                : 'bg-white/5 border-white/5 text-text-muted hover:border-hama-gold/30'
                                                                }`}
                                                        >
                                                            <div className={`p-3 rounded-xl transition-all ${isSelected ? 'bg-black/10' : 'bg-white/5 group-hover:text-hama-gold'}`}>
                                                                <Icon size={20} />
                                                            </div>
                                                            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                                                            {isSelected && (
                                                                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full" />
                                                            )}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-hama-gold/5 border border-hama-gold/10 rounded-2xl flex items-center gap-4 animate-in fade-in duration-500">
                                            <div className="w-10 h-10 bg-hama-gold/10 rounded-xl flex items-center justify-center text-hama-gold">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-hama-gold">Content Type Locked</p>
                                                <p className="text-[9px] font-bold text-hama-gold/40 uppercase tracking-widest mt-0.5">Media type synchronized to Default Language: {activeLesson.type}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dynamic Content Editor */}
                            <div className="mb-12 glass border-hama-gold/10 rounded-3xl overflow-hidden shadow-glass min-h-[500px] relative z-10">
                                <div className="px-10 py-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-2 h-2 bg-hama-gold rounded-full shadow-[0_0_10px_rgba(242,201,76,0.8)] animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Lesson Content Editor</span>
                                    </div>
                                    {isUploading && (
                                        <div className="flex items-center gap-2 text-[8px] font-black text-hama-gold uppercase tracking-widest animate-pulse">
                                            Uploading media asset...
                                        </div>
                                    )}
                                </div>
                                <div className="p-10">
                                    {renderContentEditor()}
                                </div>
                            </div>

                            {/* Delivery & Optimization Settings */}
                            {isDefaultLocale && (
                                <div className="mt-12 space-y-8 bento-card border-hama-gold/10 p-10">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-8 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-hama-gold/5 border border-hama-gold/10 rounded-2xl flex items-center justify-center text-hama-gold">
                                                <Settings size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-text-primary">Delivery Settings</h4>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Configure automated lesson delivery</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-2xl border border-white/5 shadow-inner">
                                            <Clock size={16} className="text-hama-gold" />
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Duration</span>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        className="w-12 bg-transparent text-[14px] font-black text-text-primary focus:outline-none"
                                                        value={activeLesson.durationMinutes}
                                                        onChange={(e) => updateLesson({ durationMinutes: parseInt(e.target.value) })}
                                                    />
                                                    <span className="text-[10px] font-black text-hama-gold uppercase tracking-widest">MINUTES</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                        {/* Left Column: Toggles */}
                                        <div className="space-y-4">
                                            {[
                                                { key: 'drmEnabled', label: 'DRM Protection', icon: ShieldCheck, desc: 'Enable Digital Rights Management' },
                                                { key: 'offlineAvailable', label: 'Offline Access', icon: Download, desc: 'Allow Offline Downloads' },
                                                { key: 'lowBandwidthMode', label: 'Bandwidth Optimization', icon: Globe, desc: 'Enable Low Bandwidth Mode' }
                                            ].map((opt) => (
                                                <div key={opt.key} className="p-5 bg-white/2 rounded-2xl border border-white/5 hover:border-hama-gold/20 transition-all group">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted group-hover:text-hama-gold transition-colors">
                                                                <opt.icon size={20} />
                                                            </div>
                                                            <div>
                                                                <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-text-secondary">{opt.label}</span>
                                                                <span className="block text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{opt.desc}</span>
                                                            </div>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={(activeLesson.metadata as any)[opt.key] || false}
                                                                onChange={(e) => updateLesson({ metadata: { ...activeLesson.metadata, [(opt.key as any)]: e.target.checked } })}
                                                            />
                                                            <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hama-gold/40 peer-checked:after:bg-hama-gold"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Right Column: Prerequisites */}
                                        <div className="glass border-hama-gold/10 rounded-3xl p-8 bg-black/20 flex flex-col min-h-[300px]">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-10 h-10 bg-hama-gold/10 rounded-xl flex items-center justify-center text-hama-gold">
                                                    <GitCommit size={20} />
                                                </div>
                                                <div>
                                                    <h5 className="text-[11px] font-black uppercase tracking-widest text-text-primary">Prerequisite Logic</h5>
                                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Lesson Dependencies</p>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto max-h-72 border border-white/5 rounded-2xl bg-white/2 scrollbar-none">
                                                {(course.modules || []).flatMap(m => (m.lessons || []).map(l => ({ ...l, moduleTitle: m.title })))
                                                    .filter(l => activeLesson && l.id !== activeLesson.id)
                                                    .length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-20">
                                                        <Lock size={32} className="mb-4" />
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">No Available Prerequisites</p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-white/5">
                                                        {(course.modules || []).map((mod) => {
                                                            const eligibleLessons = (mod.lessons || []).filter(l => activeLesson && l.id !== activeLesson.id);
                                                            if (eligibleLessons.length === 0) return null;

                                                            return (
                                                                <div key={mod.id}>
                                                                    <div className="bg-white/5 px-4 py-2 text-[9px] font-black text-hama-gold/40 uppercase tracking-[0.3em] sticky top-0 backdrop-blur-md">
                                                                        {mod.title}
                                                                    </div>
                                                                    {eligibleLessons.map((lesson) => (
                                                                        <label key={lesson.id} className="flex items-center justify-between p-4 hover:bg-hama-gold/5 cursor-pointer transition-all group">
                                                                            <div className="flex items-center gap-4">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-hama-gold focus:ring-hama-gold/20"
                                                                                    checked={activeLesson.prerequisiteIds?.includes(lesson.id) || false}
                                                                                    onChange={() => togglePrerequisite(lesson.id)}
                                                                                />
                                                                                <div className="flex flex-col">
                                                                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${activeLesson.prerequisiteIds?.includes(lesson.id) ? 'text-hama-gold' : 'text-text-muted group-hover:text-text-secondary'}`}>
                                                                                        {lesson.title}
                                                                                    </span>
                                                                                    <span className="text-[8px] text-text-muted/40 uppercase tracking-widest mt-0.5 font-bold">
                                                                                        {lesson.type} • {lesson.durationMinutes} MINUTES
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            {activeLesson.prerequisiteIds?.includes(lesson.id) && (
                                                                                <Lock size={12} className="text-hama-gold animate-in zoom-in duration-300" />
                                                                            )}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center group">
                            <div className="w-24 h-24 rounded-full border-2 border-dashed border-hama-gold/10 flex items-center justify-center mb-8 group-hover:border-hama-gold/40 group-hover:rotate-45 transition-all duration-1000">
                                <PenTool size={40} className="text-text-muted/20 group-hover:text-hama-gold transition-all duration-700" />
                            </div>
                            <div className="text-center space-y-3">
                                <p className="text-[12px] font-black uppercase tracking-[0.5em] text-text-muted group-hover:text-text-secondary transition-all duration-700">Select a Lesson to Edit</p>
                                <p className="text-[9px] font-bold text-text-muted/40 uppercase tracking-widest">Select a Lesson from the Course Structure or Switch to Settings</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showVersionPanel && (
                <VersionControlPanel
                    course={course}
                    onPublish={handlePublish}
                    onRestore={handleRestore}
                    onClose={() => setShowVersionPanel(false)}
                />
            )}

            {/* Lesson Editor Slide-over Panel */}
            {showLessonEditor && activeLesson && (
                <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="w-full max-w-2xl bg-bg-primary shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500 border-l border-hama-gold/10 relative overflow-hidden">
                        <div className="noise opacity-10" />

                        {/* Header */}
                        <div className="bg-bg-primary border-b border-hama-gold/10 px-6 py-4 flex justify-between items-center z-20 sticky top-0 backdrop-blur-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-hama-gold/10 border border-hama-gold/20 rounded-xl flex items-center justify-center text-hama-gold">
                                    <PenTool size={20} />
                                </div>
                                <div>
                                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-primary">Lesson Editor</h2>
                                    <p className="text-[10px] font-bold text-hama-gold/60 uppercase tracking-widest mt-0.5">{activeLesson.title}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowLessonEditor(false)}
                                className="p-2 text-text-muted hover:text-text-primary transition-colors bg-white/5 rounded-lg border border-white/5"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-6">
                            {/* Lesson Title */}
                            <div>
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3 ml-1">Lesson Title</label>
                                <input
                                    dir={isRTL ? 'rtl' : 'ltr'}
                                    className={`w-full p-4 glass border border-white/10 rounded-2xl text-[14px] font-black uppercase tracking-[0.1em] text-text-primary focus:ring-1 focus:ring-hama-gold/30 outline-none ${transparentInputClass}`}
                                    placeholder="Enter lesson title..."
                                    value={getLocalized(activeLesson, 'title') || ''}
                                    onChange={(e) => updateLessonField('title', e.target.value)}
                                />
                            </div>

                            {/* Content Type */}
                            {isDefaultLocale && (
                                <div>
                                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3 ml-1">Content Type</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[
                                            { type: ContentType.TEXT, label: 'Text', icon: FileText },
                                            { type: ContentType.VIDEO_VOD, label: 'Video', icon: Video },
                                            { type: ContentType.AUDIO_PODCAST, label: 'Audio', icon: Mic },
                                            { type: ContentType.QUIZ, label: 'Quiz', icon: CheckSquare },
                                        ].map((item) => {
                                            const Icon = item.icon;
                                            const isSelected = activeLesson.type === item.type;
                                            return (
                                                <button
                                                    key={item.type}
                                                    onClick={() => updateLesson({ type: item.type as ContentType })}
                                                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${isSelected
                                                        ? 'bg-hama-gold text-black border-hama-gold'
                                                        : 'bg-white/5 border-white/10 text-text-muted hover:border-hama-gold/30'
                                                        }`}
                                                >
                                                    <Icon size={16} />
                                                    <span className="text-[8px] font-black uppercase">{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Content Editor */}
                            <div>
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3 ml-1">Content ({currentLocale})</label>
                                <textarea
                                    dir={isRTL ? 'rtl' : 'ltr'}
                                    className={`w-full h-64 p-4 glass border border-white/10 rounded-2xl text-sm text-text-primary focus:ring-1 focus:ring-hama-gold/30 outline-none ${transparentInputClass} resize-none`}
                                    placeholder="Write your lesson content here..."
                                    value={getLocalized(activeLesson, 'content') || ''}
                                    onChange={(e) => updateLessonField('content', e.target.value)}
                                />
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3 ml-1">Duration (minutes)</label>
                                <input
                                    type="number"
                                    className={`w-full p-4 glass border border-white/10 rounded-2xl text-sm text-text-primary focus:ring-1 focus:ring-hama-gold/30 outline-none ${transparentInputClass}`}
                                    placeholder="10"
                                    value={activeLesson.durationMinutes || 10}
                                    onChange={(e) => updateLessonField('durationMinutes', String(parseInt(e.target.value) || 10))}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-hama-gold/10 bg-bg-primary/95 backdrop-blur-xl sticky bottom-0 flex justify-between">
                            <button
                                onClick={() => { setShowLessonEditor(false); setActiveLessonId(null); }}
                                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => { setShowLessonEditor(false); handleSaveDraft(); }}
                                className="px-6 py-2 bg-hama-gold text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-hama-gold/80"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseBuilder;