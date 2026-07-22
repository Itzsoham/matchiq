import { NextRequest, NextResponse } from "next/server";
import { renderCoverLetterPdf } from "@/lib/pdf/cover-letter-template";
import { CandidateContactSchema } from "@/lib/types";
import { z } from "zod";

export const runtime = "nodejs";

const BodySchema = z.object({
  coverLetter: z.string().min(1),
  contact: CandidateContactSchema,
  date: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { coverLetter, contact, date } = BodySchema.parse(body);
    const resolvedDate =
      date ?? new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const buffer = await renderCoverLetterPdf(coverLetter, contact, resolvedDate);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${contact.name.replace(/\s+/g, "_")}_Cover_Letter.pdf"`,
      },
    });
  } catch (error) {
    console.error("Cover letter PDF generation failed:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
