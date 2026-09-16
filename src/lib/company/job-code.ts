/**
 * A job code pattern is any literal text with exactly one run of `#`
 * characters marking the numeric part, e.g. "AA-####", "AA-#######",
 * "W-####", or "####-JOB". This must stay in sync with the SQL
 * implementation in `format_job_code()` — this copy is for instant client
 * previews only; the database function is the source of truth for codes
 * that are actually assigned.
 */
export const JOB_CODE_PATTERN_REGEX = /^[A-Za-z0-9_-]*#+[A-Za-z0-9_-]*$/;

export function isValidJobCodePattern(pattern: string): boolean {
  return JOB_CODE_PATTERN_REGEX.test(pattern);
}

export function formatJobCode(pattern: string, seq: number): string {
  const match = pattern.match(/#+/);
  if (!match || match.index === undefined) return pattern;

  const prefix = pattern.slice(0, match.index);
  const suffix = pattern.slice(match.index + match[0].length);
  const width = match[0].length;
  const digits = String(seq);
  const padded = digits.length >= width ? digits : digits.padStart(width, "0");

  return `${prefix}${padded}${suffix}`;
}
