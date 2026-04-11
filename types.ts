// Domain Entities

export enum CourseStatus {
  DRAFT = 'Draft',
  REVIEW = 'In Review',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived'
}

export enum ContentType {
  TEXT = 'TEXT',
  VIDEO_VOD = 'VIDEO_VOD',
  VIDEO_LIVE = 'VIDEO_LIVE',
  AUDIO_PODCAST = 'AUDIO_PODCAST',
  QUIZ = 'QUIZ',
  SCORM_HTML5 = 'SCORM_HTML5',
  VR_AR = 'VR_AR',
  SIMULATION = 'SIMULATION',
  ASSIGNMENT = 'ASSIGNMENT',
  EMBED = 'EMBED'
}

export enum VersionType {
  MAJOR = 'MAJOR', // Structural changes, breaking changes for learners
  MINOR = 'MINOR', // Content updates, non-breaking
  PATCH = 'PATCH'  // Typos, bug fixes
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actorId: string;
  actorName: string;
  details: string;
  versionContext?: string; // e.g., "v1.2"
}

export interface CourseVersion {
  version: string; // SemVer: "1.0.0"
  publishedAt: string;
  publishedBy: string;
  changeLog: string;
  versionType: VersionType;
  snapshot: Course; // Deep copy of the course at this state (excluding the versions array itself to prevent recursion)
}

export interface ContentMetadata {
  // Video & Audio
  streamUrl?: string;
  youtubeId?: string;
  captionsUrl?: string;
  transcript?: string;
  duration?: number;
  isLive?: boolean;
  enableDownload?: boolean;
  drmEnabled?: boolean;

  // SCORM / HTML5
  entryPoint?: string;
  version?: '1.2' | '2004' | 'CMI5';

  // VR / AR
  platform?: 'WebXR' | 'Unity' | 'Unreal';
  deviceSupport?: string[];

  // External Embeds
  embedCode?: string;

  // Delivery
  lowBandwidthMode?: boolean;
  offlineAvailable?: boolean;

  // Quiz Association
  quizId?: string;
}

// Localization Types
export interface LocalizedContent {
  title?: string;
  description?: string;
  content?: string; // HTML/Markdown
}

export interface Lesson {
  id: string;
  title: string;
  type: ContentType;
  durationMinutes: number;
  content?: string; // HTML or Markdown fallback (Default Locale)
  metadata: ContentMetadata;
  localizations: Record<string, LocalizedContent>; // Key is locale code (e.g. 'es-MX')
  prerequisiteIds?: string[]; // IDs of lessons that must be completed before this one unlocks
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  localizations: Record<string, LocalizedContent>;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  author: string;
  status: CourseStatus;
  lastModified: string;
  modules: Module[];
  tags: string[];

  // Localization Config
  defaultLocale: string;
  supportedLocales: string[];
  localizations: Record<string, LocalizedContent>;

  // Monetization
  price: number;
  isFree: boolean;

  // Versioning & Compliance
  currentVersion: string;
  versions: CourseVersion[];
}

export type UserRole = 'Admin' | 'Teacher' | 'Student';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl: string;
  status: UserStatus;
  department?: string;
  joinedAt: string;
  lastLogin?: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  enrolledBy: string; // Admin ID
  status: 'Active' | 'Completed' | 'Dropped';
}

export type NotificationType = 'Info' | 'Success' | 'Warning' | 'Alert' | 'Message';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// Quiz Types
export type QuizStatus = 'draft' | 'published' | 'archived';
export type QuestionStatus = 'draft' | 'approved' | 'rejected';

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  passPercentage: number;
  totalQuestions: number;
  status: QuizStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'a' | 'b' | 'c' | 'd';
  explanation?: string;
  status: QuestionStatus;
  generatedByAi: boolean;
  orderIndex: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  attemptedAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: string;
  /** Public URL of the stored PDF in Supabase storage. Null for legacy records or when PDF generation is not configured. */
  certificateUrl: string | null;
  uniqueCode: string;
  quizAttemptId?: string;
}

/** Request body for the render-certificate-pdf edge function (internal use). */
export interface RenderCertificateRequest {
  recipientName: string;
  courseName: string;
  completionDate: string;
  uniqueCode: string;
  instructorName?: string;
}

// Quiz with Questions (for taking quiz)
export interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

// Certificate Verification
export interface CertificateVerification {
  valid: boolean;
  certificate?: Certificate;
  userName?: string;
  courseTitle?: string;
  message?: string;
}
