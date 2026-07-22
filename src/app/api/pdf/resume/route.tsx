import { NextRequest, NextResponse } from "next/server";
import { renderResumePdf } from "@/lib/pdf/resume-template";
import { CandidateContactSchema, TailoredResumeSchema } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resume = TailoredResumeSchema.parse(body.resume);
    const contact = CandidateContactSchema.parse(body.contact);

    const buffer = await renderResumePdf(resume, contact);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${contact.name.replace(/\s+/g, "_")}_Resume.pdf"`,
      },
    });
  } catch (error) {
    console.error("Resume PDF generation failed:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
