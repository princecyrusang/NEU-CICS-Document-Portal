export const NEU_PROGRAMS = [
  "BS Computer Science",
  "BS Information Technology",
  "BS Information Systems"
] as const;

export type UndergraduateProgram = (typeof NEU_PROGRAMS)[number];

export const ADMIN_PROGRAM_OPTIONS = [
  "All CICS",
  ...NEU_PROGRAMS
] as const;

export type AdminProgramOption = (typeof ADMIN_PROGRAM_OPTIONS)[number];

export const DOCUMENT_CATEGORIES = [
  "Academic & Enrollment",
  "Internship & OJT",
  "Graduation Requirements",
  "Student Records & Transfer"
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
