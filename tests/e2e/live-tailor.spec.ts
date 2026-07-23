import { test, expect } from "@playwright/test";
import { RESUME_PDF_PATH, DUMMY_CANDIDATE, DUMMY_JOB_DESCRIPTION } from "./fixtures";

// Exercises the real Gemini API end to end with a dummy candidate entry
// (Soham Maury's resume, uploaded as a PDF) against a sample job description.
// Requires GEMINI_API_KEY — skipped automatically when it isn't set (e.g. on
// forks / PRs without access to the secret) so it never blocks CI by default.
test.skip(!process.env.GEMINI_API_KEY, "GEMINI_API_KEY not set — skipping live Gemini test");

test("tailors a real resume PDF against a job description via Gemini", async ({ page }) => {
  test.slow();

  await page.goto("/");

  await page.getByLabel("Full name").fill(DUMMY_CANDIDATE.name);
  await page.getByLabel("Email").fill(DUMMY_CANDIDATE.email);
  await page.getByLabel("Phone").fill(DUMMY_CANDIDATE.phone);
  await page.getByLabel("Location").fill(DUMMY_CANDIDATE.location);
  await page.getByLabel(/Links/).fill(DUMMY_CANDIDATE.links);

  await page.getByRole("tab", { name: "Upload PDF" }).click();
  await page.locator("#resume-pdf").setInputFiles(RESUME_PDF_PATH);

  await page.getByPlaceholder("Paste the target job description here...").fill(DUMMY_JOB_DESCRIPTION);

  await page.getByRole("button", { name: "Tailor My Application" }).click();

  await expect(page.getByRole("heading", { name: "Results" })).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('[data-slot="alert"]')).toHaveCount(0);

  await expect(page.getByRole("heading", { name: "Tailored Resume" })).toBeVisible();
  const summary = page.locator("text=Summary").first();
  await expect(summary).toBeVisible();

  await expect(page.getByRole("heading", { name: "Cover Letter / Outreach Email Body" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Outreach Email Subject" })).toBeVisible();

  const [download, response] = await Promise.all([
    page.waitForEvent("download"),
    page.waitForResponse((res) => res.url().includes("/api/pdf/resume") && res.request().method() === "POST"),
    page.getByRole("button", { name: "Download Resume PDF" }).click(),
  ]);
  expect(response.status()).toBe(200);
  expect(download.suggestedFilename()).toBe("Soham_Maury_Resume.pdf");
});
