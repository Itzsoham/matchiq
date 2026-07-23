import { test, expect } from "@playwright/test";
import {
  RESUME_PDF_PATH,
  DUMMY_CANDIDATE,
  DUMMY_RESUME_TEXT,
  DUMMY_JOB_DESCRIPTION,
  MOCK_TAILOR_RESULT,
} from "./fixtures";

async function fillContactFields(page: import("@playwright/test").Page) {
  await page.getByLabel("Full name").fill(DUMMY_CANDIDATE.name);
  await page.getByLabel("Email").fill(DUMMY_CANDIDATE.email);
  await page.getByLabel("Phone").fill(DUMMY_CANDIDATE.phone);
  await page.getByLabel("Location").fill(DUMMY_CANDIDATE.location);
  await page.getByLabel(/Links/).fill(DUMMY_CANDIDATE.links);
}

test.describe("MatchIQ application form", () => {
  test("shows validation errors when required fields are missing", async ({ page }) => {
    await page.goto("/");

    const formAlert = page.locator('[data-slot="alert"]');

    await page.getByRole("button", { name: "Tailor My Application" }).click();
    await expect(formAlert).toContainText("Your name is required");

    await page.getByLabel("Full name").fill(DUMMY_CANDIDATE.name);
    await page.getByRole("button", { name: "Tailor My Application" }).click();
    await expect(formAlert).toContainText("Paste your resume text or upload a PDF");

    await page.getByPlaceholder("Paste your resume text here...").fill(DUMMY_RESUME_TEXT);
    await page.getByRole("button", { name: "Tailor My Application" }).click();
    await expect(formAlert).toContainText("Paste the job description");
  });

  test("submits a pasted resume and renders tailored results", async ({ page }) => {
    await page.route("**/api/tailor", async (route) => {
      await route.fulfill({ json: MOCK_TAILOR_RESULT });
    });

    await page.goto("/");
    await fillContactFields(page);
    await page.getByPlaceholder("Paste your resume text here...").fill(DUMMY_RESUME_TEXT);
    await page.getByPlaceholder("Paste the target job description here...").fill(DUMMY_JOB_DESCRIPTION);

    await page.getByRole("button", { name: "Tailor My Application" }).click();

    await expect(page.getByRole("heading", { name: "Results" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tailored Resume" })).toBeVisible();
    await expect(page.getByText(MOCK_TAILOR_RESULT.tailored_resume.summary)).toBeVisible();
    for (const skill of MOCK_TAILOR_RESULT.tailored_resume.skills) {
      await expect(page.getByText(skill, { exact: true })).toBeVisible();
    }
    await expect(page.getByText(MOCK_TAILOR_RESULT.cover_letter_full)).toBeVisible();
    await expect(page.getByText(MOCK_TAILOR_RESULT.outreach_email.subject)).toBeVisible();
  });

  test("submits an uploaded resume PDF and renders tailored results", async ({ page }) => {
    await page.route("**/api/tailor", async (route) => {
      await route.fulfill({ json: MOCK_TAILOR_RESULT });
    });
    // Not under test here — stub it out so the contact-autofill fetch doesn't
    // add noise to this spec's assertions or logs.
    await page.route("**/api/extract-contact", async (route) => {
      await route.fulfill({ json: { email: null, phone: null, links: [] } });
    });

    await page.goto("/");
    await fillContactFields(page);

    await page.getByRole("tab", { name: "Upload PDF" }).click();
    await page.locator("#resume-pdf").setInputFiles(RESUME_PDF_PATH);
    await expect(page.getByText("resume.pdf")).toBeVisible();

    await page.getByPlaceholder("Paste the target job description here...").fill(DUMMY_JOB_DESCRIPTION);
    await page.getByRole("button", { name: "Tailor My Application" }).click();

    await expect(page.getByRole("heading", { name: "Results" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tailored Resume" })).toBeVisible();
  });

  test("downloads resume and cover letter PDFs after results are generated", async ({ page }) => {
    await page.route("**/api/tailor", async (route) => {
      await route.fulfill({ json: MOCK_TAILOR_RESULT });
    });

    await page.goto("/");
    await fillContactFields(page);
    await page.getByPlaceholder("Paste your resume text here...").fill(DUMMY_RESUME_TEXT);
    await page.getByPlaceholder("Paste the target job description here...").fill(DUMMY_JOB_DESCRIPTION);
    await page.getByRole("button", { name: "Tailor My Application" }).click();
    await expect(page.getByRole("heading", { name: "Results" })).toBeVisible();

    const [resumeDownload, resumeResponse] = await Promise.all([
      page.waitForEvent("download"),
      page.waitForResponse((res) => res.url().includes("/api/pdf/resume") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Download Resume PDF" }).click(),
    ]);
    expect(resumeResponse.status()).toBe(200);
    expect(resumeResponse.headers()["content-type"]).toContain("application/pdf");
    expect(resumeDownload.suggestedFilename()).toBe("Soham_Maury_Resume.pdf");

    const [coverDownload, coverResponse] = await Promise.all([
      page.waitForEvent("download"),
      page.waitForResponse((res) => res.url().includes("/api/pdf/cover-letter") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Download Cover Letter PDF" }).click(),
    ]);
    expect(coverResponse.status()).toBe(200);
    expect(coverResponse.headers()["content-type"]).toContain("application/pdf");
    expect(coverDownload.suggestedFilename()).toBe("Soham_Maury_Cover_Letter.pdf");
  });
});
