import { Course, CourseVersion, VersionType, AuditLogEntry } from "../types";

/**
 * Calculates the next semantic version number.
 */
export const calculateNextVersion = (currentVersion: string, type: VersionType): string => {
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  switch (type) {
    case VersionType.MAJOR:
      return `${major + 1}.0.0`;
    case VersionType.MINOR:
      return `${major}.${minor + 1}.0`;
    case VersionType.PATCH:
      return `${major}.${minor}.${patch + 1}`;
    default:
      return currentVersion;
  }
};

/**
 * Creates an immutable snapshot of the course.
 * Critical for regulatory compliance and rollback capability.
 */
export const createVersionSnapshot = (
  course: Course,
  type: VersionType,
  changeLog: string,
  actorName: string
): Course => {
  const nextVersion = calculateNextVersion(course.currentVersion, type);

  // Create the snapshot object (excluding the history itself to keep snapshots clean)
  // We use JSON parse/stringify for a deep copy to ensure immutability
  const { versions, auditLog, ...courseData } = course;
  const snapshotData = JSON.parse(JSON.stringify(courseData)) as Course;

  const newVersionEntry: CourseVersion = {
    version: nextVersion,
    publishedAt: new Date().toISOString(),
    publishedBy: actorName,
    changeLog,
    versionType: type,
    snapshot: { ...snapshotData, currentVersion: nextVersion } // The snapshot sees itself as the new version
  };

  const newAuditEntry: AuditLogEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    action: 'PUBLISH_VERSION',
    actorId: actorName === 'Admin User' ? 'user-1' : '', // This should ideally be passed in
    actorName: actorName,
    details: `Published version ${nextVersion} (${type}): ${changeLog}`,
    versionContext: nextVersion
  };

  return {
    ...course,
    currentVersion: nextVersion,
    status: 'Published' as any,
    versions: [newVersionEntry, ...course.versions], // Prepend new version
    auditLog: [newAuditEntry, ...course.auditLog]
  };
};

/**
 * Restores a course to a previous version.
 * NOTE: This does NOT delete history. It creates a new "Draft" state based on old data.
 * This preserves the audit trail.
 */
export const restoreVersion = (course: Course, versionToRestore: CourseVersion, actorName: string): Course => {
  // Deep copy the snapshot
  const { versions, auditLog, ...restoredData } = versionToRestore.snapshot;
  const snapshotCopy = JSON.parse(JSON.stringify(restoredData));

  const newAuditEntry: AuditLogEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    action: 'ROLLBACK_VERSION',
    actorId: 'user-1',
    actorName: actorName,
    details: `Rolled back state to version ${versionToRestore.version}`,
    versionContext: course.currentVersion
  };

  return {
    ...course, // Keep the outer shell (ID, etc)
    ...snapshotCopy, // Overwrite content with snapshot
    status: 'Draft' as any, // Revert status to draft so it can be edited
    versions: course.versions, // PRESERVE HISTORY - Critical for compliance
    auditLog: [newAuditEntry, ...course.auditLog]
  };
};

export const logAction = (course: Course, action: string, details: string, actorName: string): Course => {
  const newAuditEntry: AuditLogEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    action: action,
    actorId: 'user-1',
    actorName: actorName,
    details: details,
    versionContext: course.currentVersion
  };

  return {
    ...course,
    auditLog: [newAuditEntry, ...course.auditLog]
  };
};