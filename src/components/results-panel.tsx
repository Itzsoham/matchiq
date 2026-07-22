"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CopyButton } from "@/components/copy-button";
import type { CandidateContact, TailorResult } from "@/lib/types";

async function downloadPdf(url: string, body: unknown, filename: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to generate PDF" }));
    throw new Error(err.error ?? "Failed to generate PDF");
  }
  const blob = await res.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function ResultsPanel({
  result,
  contact,
}: {
  result: TailorResult;
  contact: CandidateContact;
}) {
  const [downloading, setDownloading] = useState<"resume" | "cover" | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownloadResume() {
    setDownloading("resume");
    setDownloadError(null);
    try {
      await downloadPdf(
        "/api/pdf/resume",
        { resume: result.tailored_resume, contact },
        `${contact.name.replace(/\s+/g, "_")}_Resume.pdf`,
      );
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Failed to generate PDF");
    } finally {
      setDownloading(null);
    }
  }

  async function handleDownloadCoverLetter() {
    setDownloading("cover");
    setDownloadError(null);
    try {
      await downloadPdf(
        "/api/pdf/cover-letter",
        { coverLetter: result.cover_letter_full, contact },
        `${contact.name.replace(/\s+/g, "_")}_Cover_Letter.pdf`,
      );
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Failed to generate PDF");
    } finally {
      setDownloading(null);
    }
  }

  const { tailored_resume: resume } = result;

  return (
    <div className="flex flex-col gap-6">
      {downloadError ? (
        <Alert variant="destructive">
          <AlertTitle>Download failed</AlertTitle>
          <AlertDescription>{downloadError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDownloadResume} disabled={downloading !== null}>
          {downloading === "resume" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Download Resume PDF
        </Button>
        <Button
          onClick={handleDownloadCoverLetter}
          disabled={downloading !== null}
          variant="secondary"
        >
          {downloading === "cover" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Download Cover Letter PDF
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tailored Resume</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          <div>
            <h4 className="mb-1 font-semibold">Summary</h4>
            <p className="text-muted-foreground">{resume.summary}</p>
          </div>
          <Separator />
          <div>
            <h4 className="mb-1.5 font-semibold">Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.map((skill, i) => (
                <Badge key={i} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="mb-2 font-semibold">Experience</h4>
            <div className="flex flex-col gap-4">
              {resume.experience.map((entry, i) => (
                <div key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-medium">
                      {entry.title} · {entry.company}
                    </span>
                    <span className="text-xs text-muted-foreground">{entry.dates}</span>
                  </div>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                    {entry.bullets.map((bullet, j) => (
                      <li key={j}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          {resume.projects.length > 0 ? (
            <>
              <Separator />
              <div>
                <h4 className="mb-2 font-semibold">Projects</h4>
                <div className="flex flex-col gap-3">
                  {resume.projects.map((project, i) => (
                    <div key={i}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <span className="font-medium">{project.name}</span>
                        {project.tech.length > 0 ? (
                          <span className="text-xs text-muted-foreground">
                            {project.tech.join(", ")}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-muted-foreground">{project.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
          {resume.education.length > 0 ? (
            <>
              <Separator />
              <div>
                <h4 className="mb-1 font-semibold">Education</h4>
                {resume.education.map((line, i) => (
                  <p key={i} className="text-muted-foreground">
                    {line}
                  </p>
                ))}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cover Letter / Outreach Email Body</CardTitle>
          <CopyButton text={result.cover_letter_full} />
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {result.cover_letter_full}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Short Pitch (&quot;Why this role?&quot;)</CardTitle>
          <CopyButton text={result.short_pitch} />
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {result.short_pitch}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Outreach Email Subject</CardTitle>
          <CopyButton text={result.outreach_email.subject} />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{result.outreach_email.subject}</p>
        </CardContent>
      </Card>

      {result.gaps.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Gaps to Be Aware Of</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {result.gaps.map((gap, i) => (
                <li key={i}>{gap}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
