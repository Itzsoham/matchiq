import { test, expect } from "@playwright/test";
import { RESUME_PDF_PATH, DUMMY_CANDIDATE, DUMMY_RESUME_TEXT } from "./fixtures";

test.describe("Resume contact autofill", () => {
  test("autofills email, phone, and links from pasted resume text", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder("Paste your resume text here...").fill(DUMMY_RESUME_TEXT);

    await expect(page.getByLabel("Email")).toHaveValue(DUMMY_CANDIDATE.email, { timeout: 2000 });
    await expect(page.getByLabel("Phone")).toHaveValue(DUMMY_CANDIDATE.phone);
    await expect(page.getByLabel(/Links/)).toHaveValue(DUMMY_CANDIDATE.links.split("\n").join("\n"));
  });

  test("does not overwrite contact fields the candidate already filled in", async ({ page }) => {
    await page.goto("/");

    const manualEmail = "manually-entered@example.com";
    await page.getByLabel("Email").fill(manualEmail);

    await page.getByPlaceholder("Paste your resume text here...").fill(DUMMY_RESUME_TEXT);

    // Give the debounced autofill a chance to run, then confirm it left the
    // manually-entered email alone while still filling the untouched phone field.
    await expect(page.getByLabel("Phone")).toHaveValue(DUMMY_CANDIDATE.phone, { timeout: 2000 });
    await expect(page.getByLabel("Email")).toHaveValue(manualEmail);
  });

  test("autofills contact details from an uploaded resume PDF", async ({ page }) => {
    await page.route("**/api/extract-contact", async (route) => {
      await route.fulfill({
        json: { email: DUMMY_CANDIDATE.email, phone: DUMMY_CANDIDATE.phone, links: DUMMY_CANDIDATE.links.split("\n") },
      });
    });

    await page.goto("/");
    await page.getByRole("tab", { name: "Upload PDF" }).click();
    await page.locator("#resume-pdf").setInputFiles(RESUME_PDF_PATH);

    await expect(page.getByLabel("Email")).toHaveValue(DUMMY_CANDIDATE.email, { timeout: 2000 });
    await expect(page.getByLabel("Phone")).toHaveValue(DUMMY_CANDIDATE.phone);
    await expect(page.getByLabel(/Links/)).toHaveValue(DUMMY_CANDIDATE.links);
  });
});
