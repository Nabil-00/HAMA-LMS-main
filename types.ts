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

  // Versioning & Compliance
  currentVersion: string; // e.g. "0.0.1" (Draft) or "1.0.0" (Live)
  versions: CourseVersion[];
  auditLog: AuditLogEntry[];
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
