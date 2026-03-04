import { Course, CourseVersion, VersionType } from "../types";

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

export const createVersionSnapshot = (
  course: Course,
  type: VersionType,
  changeLog: string,
  actorName: string
): Course => {
  const nextVersion = calculateNextVersion(course.currentVersion, type);

  const newVersionEntry: CourseVersion = {
    version: nextVersion,
    publishedAt: new Date().toISOString(),
    publishedBy: actorName,
    changeLog,
    versionType: type,
    snapshot: { ...course, currentVersion: nextVersion }
  };

  return {
    ...course,
    currentVersion: nextVersion,
    status: 'Published' as any,
    versions: [newVersionEntry, ...course.versions]
  };
};

export const restoreVersion = (course: Course, versionToRestore: CourseVersion, actorName: string): Course => {
  const snapshotCopy = JSON.parse(JSON.stringify(versionToRestore.snapshot));

  return {
    ...course,
    ...snapshotCopy,
    status: 'Draft' as any,
    versions: course.versions
  };
};
