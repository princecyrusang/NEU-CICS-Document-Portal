export const NEU_PROGRAMS = [
  "BS in Computer Science",
  "BS in Information Technology",
  "BS in Business Administration",
  "BS in Accountancy",
  "BS in Civil Engineering",
  "BS in Mechanical Engineering",
  "BS in Electrical Engineering",
  "BS in Nursing",
  "Bachelor of Elementary Education",
  "Bachelor of Secondary Education",
  "BS in Psychology",
  "BS in Biology",
  "BS in Hotel and Restaurant Management",
  "AB in Communication",
  "AB in Political Science",
  "Bachelor of Laws"
] as const;

export type UndergraduateProgram = (typeof NEU_PROGRAMS)[number];