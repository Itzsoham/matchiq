import { NextRequest, NextResponse } from "next/server";
import { extractPdfText } from "@/lib/pdf-extract";
import { extractContactFromResumeText } from "@/lib/contact-extract";

export const runtime = "nodejs";

// This runs automatically on every file selection (no other required fields
// gating it, unlike /api/tailor), so it's a cheaper target for repeated
// abuse — keep a basic size/type guard here.
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Best-effort contact-detail autofill from an uploaded resume PDF — plain
// text extraction + regex, no Gemini call, so it's fast/free and safe to
// run immediately on file selection rather than waiting for full tailoring.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get("resumeFile");

    if (!(resumeFile instanceof File) || resumeFile.size === 0) {
      return NextResponse.json({ error: "No resume file provided" }, { status: 400 });
    }
    if (resumeFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Resume file is too large" }, { status: 413 });
    }
    if (resumeFile.type && resumeFile.type !== "application/pdf") {
      return NextResponse.json({ error: "Resume file must be a PDF" }, { status: 400 });
    }

    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    const text = await extractPdfText(buffer);
    const contact = extractContactFromResumeText(text);

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Contact extraction failed:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
