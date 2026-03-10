export const NEU_PROGRAMS = [
  "BS in Computer Science",
  "BS in Information Technology",
  "BS in Information Systems",
  "BS in Library and Information Science",
  "BS in Entertainment and Multimedia Computing",
  "BS in Data Science"
] as const;

export type UndergraduateProgram = (typeof NEU_PROGRAMS)[number];

export const DOCUMENT_CATEGORIES = [
  "Enrollment & Subjects",
  "OJT & Internship",
  "Graduation",
  "Administrative Requests",
  "Department Memos",
  "Other"
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
