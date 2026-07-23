import { NextRequest, NextResponse } from "next/server";
import { extractPdfText } from "@/lib/pdf-extract";
import { tailorApplication } from "@/lib/gemini";

export const runtime = "nodejs";
// The Gemini call with a large structured-output schema regularly takes
// 15-20+ seconds; Vercel's default function timeout (~10s on Hobby) kills
// the request before it responds, surfacing as a platform-level 500 instead
// of this route's own error handling.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const jdText = String(formData.get("jdText") ?? "").trim();
    const styleSamples = String(formData.get("styleSamples") ?? "").trim();
    const resumeTextField = String(formData.get("resumeText") ?? "").trim();
    const resumeFile = formData.get("resumeFile");

    if (!jdText) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 },
      );
    }

    let resumeText = resumeTextField;

    if (resumeFile instanceof File && resumeFile.size > 0) {
      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      resumeText = await extractPdfText(buffer);
    }

    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text or PDF is required" },
        { status: 400 },
      );
    }

    const result = await tailorApplication({ resumeText, jdText, styleSamples });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Tailor request failed:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
