"use client";

import { useRef, useState } from "react";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { CandidateContact, TailorResult } from "@/lib/types";

export function ApplicationForm({
  onResult,
  onContactChange,
}: {
  onResult: (result: TailorResult) => void;
  onContactChange: (contact: CandidateContact) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [links, setLinks] = useState("");

  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [styleSamples, setStyleSamples] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Your name is required to build the resume header.");
      return;
    }
    if (!resumeText.trim() && !resumeFile) {
      setError("Paste your resume text or upload a PDF.");
      return;
    }
    if (!jdText.trim()) {
      setError("Paste the job description.");
      return;
    }

    const contact: CandidateContact = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      links: links
        .split(/[\n,]/)
        .map((l) => l.trim())
        .filter(Boolean),
    };
    onContactChange(contact);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("jdText", jdText);
      formData.set("styleSamples", styleSamples);
      if (resumeFile) {
        formData.set("resumeFile", resumeFile);
      } else {
        formData.set("resumeText", resumeText);
      }

      const res = await fetch("/api/tailor", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to tailor application");
      }
      onResult(data as TailorResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Details</CardTitle>
          <CardDescription>Used for the resume header and cover letter signature.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="links">Links (LinkedIn, GitHub, portfolio — one per line)</Label>
            <Textarea id="links" rows={2} value={links} onChange={(e) => setLinks(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resume</CardTitle>
          <CardDescription>Paste your resume text, or upload the PDF — either works.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="paste"
            onValueChange={() => {
              setResumeFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            <TabsList>
              <TabsTrigger value="paste">Paste text</TabsTrigger>
              <TabsTrigger value="upload">Upload PDF</TabsTrigger>
            </TabsList>
            <TabsContent value="paste">
              <Textarea
                rows={10}
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </TabsContent>
            <TabsContent value="upload">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="resume-pdf"
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground hover:bg-accent/50"
                >
                  <Upload className="size-6" />
                  {resumeFile ? resumeFile.name : "Click to choose a PDF file"}
                </label>
                <input
                  ref={fileInputRef}
                  id="resume-pdf"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={10}
            placeholder="Paste the target job description here..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Style Reference (optional)</CardTitle>
          <CardDescription>
            Paste a sample of your own past writing so the tone matches you — content is never
            copied, only tone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            placeholder="Paste a past cover letter, email, or message you've written..."
            value={styleSamples}
            onChange={(e) => setStyleSamples(e.target.value)}
          />
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" size="lg" disabled={loading} className="self-start">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {loading ? "Tailoring…" : "Tailor My Application"}
      </Button>
    </form>
  );
}
