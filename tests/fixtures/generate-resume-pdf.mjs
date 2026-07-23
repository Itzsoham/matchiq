// One-off generator for tests/fixtures/resume.pdf — a real, parseable PDF built
// from Soham Maury's resume text, used as the "dummy entry" in e2e tests.
// Run with: node tests/fixtures/generate-resume-pdf.mjs
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { Document, Page, Text, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 10 },
  name: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  contact: { fontSize: 9, marginBottom: 10 },
  heading: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 8, marginBottom: 3 },
  line: { fontSize: 10, marginBottom: 2, lineHeight: 1.3 },
});

const RESUME_TEXT = {
  name: "Soham Maury",
  contact: "Ahmedabad, India | +91 98765 43210 | soham.test@example.com | linkedin.com/in/sohammaury | github.com/itzsoham",
  summary:
    "Frontend Lead with 3 years of experience architecting scalable React.js and Next.js applications, component libraries, and Micro-Frontend systems for enterprise and AI-powered SaaS platforms. Specializing in TypeScript, React Query, and performance optimization.",
  experience: [
    {
      title: "Frontend Lead, Neminath Technologies (May 2025 - Present)",
      bullets: [
        "Led frontend development for 6+ enterprise applications including Task Management, HRM, CRM, Recruitment, and Audit platforms, serving 1,000+ active users.",
        "Architected Micro-Frontend modules and created 50+ reusable UI components, form builders, dashboards, and workflow modules.",
        "Established CI-driven testing pipelines using React Testing Library and Playwright, reducing regression issues.",
        "Mentored 4 interns and junior developers through code reviews and technical guidance.",
      ],
    },
    {
      title: "Full-Stack Developer, ZenDevX Solutions Pvt. Ltd. (Sep 2023 - Apr 2025)",
      bullets: [
        "Delivered ERP, CRM, and Inventory Management systems for 7+ clients using React, Next.js, Node.js, MongoDB, and MySQL.",
        "Designed responsive dashboards and workflow automation tools, cutting reporting time and manual errors by 30-50%.",
        "Enhanced a no-code platform generating applications across 2 stacks with 3 database backends.",
      ],
    },
  ],
  projects: [
    "Operato - AI-Powered Restaurant SaaS: multi-tenant platform with tenant-isolated PostgreSQL data modeling via Prisma, natural-language-to-SQL query assistant (Gemini).",
    "My Piano Diary - Piano Lesson Manager: full-stack scheduling and billing platform with tRPC and Prisma.",
    "Skillza - Learning Management System: instructor course creation, student purchasing, AWS-powered media storage.",
    "The Royal Stay - Hotel Management System: booking management, cabin administration, customer reservations.",
  ],
  education: ["Silver Oak University, Bachelor of Engineering in Information Technology (2021-2025), CGPA: 9.0/10"],
  skills:
    "React.js, Next.js, TypeScript, JavaScript, React Query, Redux Toolkit, Tailwind CSS, Playwright, React Testing Library, Node.js, Express.js, tRPC, Prisma, MongoDB, PostgreSQL, MySQL",
};

function ResumeFixtureDocument() {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "LETTER", style: styles.page },
      React.createElement(Text, { style: styles.name }, RESUME_TEXT.name),
      React.createElement(Text, { style: styles.contact }, RESUME_TEXT.contact),
      React.createElement(Text, { style: styles.heading }, "Summary"),
      React.createElement(Text, { style: styles.line }, RESUME_TEXT.summary),
      React.createElement(Text, { style: styles.heading }, "Experience"),
      ...RESUME_TEXT.experience.flatMap((entry, i) => [
        React.createElement(Text, { key: `t${i}`, style: { ...styles.line, fontFamily: "Helvetica-Bold" } }, entry.title),
        ...entry.bullets.map((bullet, j) =>
          React.createElement(Text, { key: `t${i}-b${j}`, style: styles.line }, `- ${bullet}`),
        ),
      ]),
      React.createElement(Text, { style: styles.heading }, "Projects"),
      ...RESUME_TEXT.projects.map((project, i) =>
        React.createElement(Text, { key: `p${i}`, style: styles.line }, `- ${project}`),
      ),
      React.createElement(Text, { style: styles.heading }, "Education"),
      ...RESUME_TEXT.education.map((line, i) =>
        React.createElement(Text, { key: `e${i}`, style: styles.line }, line),
      ),
      React.createElement(Text, { style: styles.heading }, "Technical Skills"),
      React.createElement(Text, { style: styles.line }, RESUME_TEXT.skills),
    ),
  );
}

const buffer = await renderToBuffer(React.createElement(ResumeFixtureDocument));
await writeFile(path.join(__dirname, "resume.pdf"), buffer);
console.log("Wrote tests/fixtures/resume.pdf (" + buffer.length + " bytes)");
