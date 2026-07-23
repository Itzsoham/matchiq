import path from "node:path";

export const RESUME_PDF_PATH = path.join(__dirname, "..", "fixtures", "resume.pdf");

// The "dummy entry" used across e2e tests — matches tests/fixtures/resume.pdf.
export const DUMMY_CANDIDATE = {
  name: "Soham Maury",
  email: "soham.test@example.com",
  phone: "+91 98765 43210",
  location: "Ahmedabad, India",
  links: "linkedin.com/in/sohammaury\ngithub.com/itzsoham",
};

export const DUMMY_RESUME_TEXT = `Soham Maury
Frontend Lead with 3 years of experience architecting scalable React.js and Next.js applications,
component libraries, and Micro-Frontend systems for enterprise and AI-powered SaaS platforms.

Experience
Frontend Lead, Neminath Technologies (May 2025 - Present)
- Led frontend development for 6+ enterprise applications serving 1,000+ active users.
- Architected Micro-Frontend modules and created 50+ reusable UI components.
- Established CI-driven testing pipelines using React Testing Library and Playwright.

Full-Stack Developer, ZenDevX Solutions Pvt. Ltd. (Sep 2023 - Apr 2025)
- Delivered ERP, CRM, and Inventory Management systems for 7+ clients using React, Next.js, Node.js.

Skills
React.js, Next.js, TypeScript, React Query, Redux Toolkit, Tailwind CSS, Playwright, Node.js, Prisma`;

export const DUMMY_JOB_DESCRIPTION = `Frontend Engineer - SaaS Platform

We're looking for a Frontend Engineer with strong React.js and Next.js experience to help build
our AI-powered SaaS product. You'll own core UI modules, work closely with design, and help
establish testing practices across the frontend codebase.

Requirements:
- 2+ years of experience with React.js and TypeScript
- Experience with Next.js (App Router)
- Familiarity with automated testing (Playwright, React Testing Library)
- Experience with component libraries and design systems`;

export const MOCK_TAILOR_RESULT = {
  tailored_resume: {
    summary:
      "Frontend Lead with 3 years of experience building React.js and Next.js applications, specializing in component libraries and automated testing.",
    skills: ["React.js", "Next.js", "TypeScript", "Playwright", "React Testing Library"],
    experience: [
      {
        title: "Frontend Lead",
        company: "Neminath Technologies",
        dates: "May 2025 - Present",
        bullets: [
          "Led frontend development for 6+ enterprise applications serving 1,000+ active users.",
          "Established CI-driven testing pipelines using React Testing Library and Playwright.",
        ],
      },
    ],
    projects: [
      {
        name: "Operato",
        description: "AI-powered restaurant SaaS platform built with Next.js and Prisma.",
        tech: ["Next.js", "TypeScript", "Prisma"],
      },
    ],
    education: ["Silver Oak University, B.E. Information Technology (2021-2025), CGPA: 9.0/10"],
  },
  cover_letter_full:
    "I'm excited to apply for the Frontend Engineer role. Over the past three years I've led frontend " +
    "development for six enterprise applications and established CI-driven Playwright testing pipelines, " +
    "which lines up directly with what this role is asking for.",
  short_pitch:
    "I'm a Frontend Lead who has spent the last three years building React.js and Next.js applications " +
    "for enterprise SaaS platforms, with a strong focus on component architecture and automated testing.",
  outreach_email: {
    subject: "Frontend Engineer Application - Soham Maury",
  },
  gaps: ["Job description mentions design systems ownership; resume doesn't explicitly call this out."],
};
