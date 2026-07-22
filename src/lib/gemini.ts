import { GoogleGenAI, Type } from "@google/genai";
import { TailorResultSchema, type TailorResult } from "@/lib/types";
import { buildTailorPrompt } from "@/lib/prompt";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const experienceEntrySchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    company: { type: Type.STRING },
    dates: { type: Type.STRING },
    bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["title", "company", "dates", "bullets"],
};

const projectEntrySchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    tech: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["name", "description", "tech"],
};

const tailorResultResponseSchema = {
  type: Type.OBJECT,
  properties: {
    tailored_resume: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        experience: { type: Type.ARRAY, items: experienceEntrySchema },
        projects: { type: Type.ARRAY, items: projectEntrySchema },
        education: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["summary", "skills", "experience", "projects", "education"],
    },
    cover_letter_full: { type: Type.STRING },
    short_pitch: { type: Type.STRING },
    outreach_email: {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING },
      },
      required: ["subject"],
    },
    gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["tailored_resume", "cover_letter_full", "short_pitch", "outreach_email", "gaps"],
};

export async function tailorApplication(params: {
  resumeText: string;
  jdText: string;
  styleSamples: string;
}): Promise<TailorResult> {
  const prompt = buildTailorPrompt(params);

  const response = await client.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-flash-latest",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: tailorResultResponseSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed = JSON.parse(text);
  return TailorResultSchema.parse(parsed);
}
