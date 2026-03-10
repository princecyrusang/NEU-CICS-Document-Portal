
export const NEU_PROGRAMS = [
  "BS in Computer Science",
  "BS in Information Technology",
  "BS in Information Systems",
  "BS in Library and Information Science",
  "BS in Entertainment and Multimedia Computing",
  "BS in Data Science"
] as const;

export type UndergraduateProgram = (typeof NEU_PROGRAMS)[number];

export const DOCUMENT_TYPES = [
  "Syllabus",
  "Lab Manual",
  "Thesis",
  "Lecture Notes",
  "Problem Set",
  "Reference Material",
  "Other"
] as const;
