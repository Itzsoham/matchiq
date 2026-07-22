"use client";

import { useState } from "react";
import { ApplicationForm } from "@/components/application-form";
import { ResultsPanel } from "@/components/results-panel";
import type { CandidateContact, TailorResult } from "@/lib/types";

export default function Home() {
  const [result, setResult] = useState<TailorResult | null>(null);
  const [contact, setContact] = useState<CandidateContact | null>(null);

  return (
    <div className="flex flex-1 justify-center bg-muted/30">
      <main className="w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">MatchIQ</h1>
          <p className="text-muted-foreground">
            Paste your resume and a job description — get a tailored resume, cover letter, short
            pitch, and outreach subject line, all grounded in what you&apos;ve actually done.
          </p>
        </div>

        <ApplicationForm onResult={setResult} onContactChange={setContact} />

        {result && contact ? (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Results</h2>
            <ResultsPanel result={result} contact={contact} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
