import { z } from "zod";

export const ExperienceEntrySchema = z.object({
  title: z.string(),
  company: z.string(),
  dates: z.string(),
  bullets: z.array(z.string()),
});

export const ProjectEntrySchema = z.object({
  name: z.string(),
  description: z.string(),
  tech: z.array(z.string()),
});

export const TailoredResumeSchema = z.object({
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(ExperienceEntrySchema),
  projects: z.array(ProjectEntrySchema),
  education: z.array(z.string()),
});

export const TailorResultSchema = z.object({
  tailored_resume: TailoredResumeSchema,
  cover_letter_full: z.string(),
  short_pitch: z.string(),
  outreach_email: z.object({
    subject: z.string(),
  }),
  gaps: z.array(z.string()),
});

export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
export type ProjectEntry = z.infer<typeof ProjectEntrySchema>;
export type TailoredResume = z.infer<typeof TailoredResumeSchema>;
export type TailorResult = z.infer<typeof TailorResultSchema>;

export const CandidateContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  location: z.string().optional().default(""),
  links: z.array(z.string()).optional().default([]),
});

export type CandidateContact = z.infer<typeof CandidateContactSchema>;

export const TailorRequestSchema = z.object({
  resumeText: z.string().min(1, "Resume text is required"),
  jdText: z.string().min(1, "Job description is required"),
  styleSamples: z.string().optional().default(""),
});

export type TailorRequest = z.infer<typeof TailorRequestSchema>;
