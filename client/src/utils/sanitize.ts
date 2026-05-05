/**
 * Strips HTML tags and control characters from input.
 * Preserves newlines (\n) and tabs (\t) for legitimate formatting.
 * Strips carriage returns (\r) to prevent CRLF injection.
 *
 * Use for: message bodies, descriptions, general text fields.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Strips HTML tags and ALL control characters including \r, \n, \t.
 * The result is always a single line with no control characters.
 *
 * Use for: email subjects, any field that must be single-line.
 * Prevents SMTP header injection (CWE-93).
 */
export function sanitizeEmailSubject(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Validates that a URL uses the HTTPS scheme.
 * Returns the URL if valid, empty string otherwise.
 * Blocks javascript:, data:, http:, and other schemes.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return '';
}
