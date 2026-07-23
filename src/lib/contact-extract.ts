export type ExtractedContact = {
  email: string | null;
  phone: string | null;
  links: string[];
};

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

// Candidate digit-and-separator runs (space/dash/dot/parens only — never \s,
// which would let a match span newlines and merge unrelated numbers, e.g. a
// GPA line bleeding into the graduation years below it). Filtered below by
// total digit count so things like a "2021 - 2025" date range or "CGPA:
// 9.0/10" don't match.
const PHONE_CANDIDATE_RE = /\+?\(?\d[\d ().-]{7,}\d/g;

const PROFILE_LINK_RE =
  /\b(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com|github\.com)\/[^\s,;|()]+/gi;
// (?<!@) keeps this from matching the domain half of an email address
// (e.g. "john.doe@mail.io" shouldn't also surface "mail.io" as a link).
const PORTFOLIO_LINK_RE =
  /\b(?<!@)(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.(?:dev|io|me|app)\/?[^\s,;|()]*/gi;

function looksLikePhone(candidate: string): boolean {
  const digits = candidate.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

export function extractContactFromResumeText(text: string): ExtractedContact {
  const email = text.match(EMAIL_RE)?.[0] ?? null;

  const phoneCandidate = (text.match(PHONE_CANDIDATE_RE) ?? []).find(looksLikePhone);
  const phone = phoneCandidate?.trim() ?? null;

  const rawLinks = [
    ...(text.match(PROFILE_LINK_RE) ?? []),
    ...(text.match(PORTFOLIO_LINK_RE) ?? []),
  ].map((link) => link.trim().replace(/[.,;]+$/, ""));
  const links = Array.from(new Set(rawLinks));

  return { email, phone, links };
}
