// ---------------------------------------------------------------------------
// Security utilities — proven patterns from pen test findings
//
// These functions address two classes of vulnerability:
//   1. Mass Assignment (CWE-915) — use pick() to allowlist request body fields
//   2. CRLF Injection (CWE-93) — use sanitizeString/sanitizeEmailSubject to
//      strip control characters before forwarding to downstream APIs
//
// Usage:
//   const { pick, sanitizeString, isNonEmptyString } = require('../utils/security');
// ---------------------------------------------------------------------------

/**
 * Returns true if val is a non-empty string (after trimming whitespace).
 * Use this to validate required string fields before processing.
 */
function isNonEmptyString(val) {
    return typeof val === 'string' && val.trim().length > 0;
}

/**
 * Strips HTML angle brackets and control characters from a string.
 * Preserves newlines (\n) and tabs (\t) for legitimate formatting.
 * Strips carriage returns (\r) to prevent CRLF injection.
 *
 * Use for: message bodies, descriptions, general text fields.
 */
function sanitizeString(val) {
    if (typeof val !== 'string') return '';
    return val
        .replace(/<[^>]*>/g, '')
        .replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '')
        .trim();
}

/**
 * Strips HTML angle brackets and ALL control characters including \r, \n, \t.
 * The result is always a single line with no control characters.
 *
 * Use for: email subjects, HTTP header values, any field that must be single-line.
 * This prevents SMTP header injection (CWE-93) where \r\n in a subject field
 * lets an attacker inject BCC headers or replace the email body entirely.
 */
function sanitizeEmailSubject(val) {
    if (typeof val !== 'string') return '';
    return val
        .replace(/<[^>]*>/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .trim();
}

/**
 * Returns a new object containing only the specified keys from obj.
 * Use this to allowlist request body fields before forwarding to a downstream API.
 *
 * This prevents mass assignment (CWE-915) where an attacker adds extra fields
 * like { approvalStatus: "APPROVED" } to a POST body and the server blindly
 * forwards them to the backend API.
 *
 * Example:
 *   const body = pick(req.body, ['name', 'email', 'message']);
 *   axios.post(url, body, ...);  // only name, email, message forwarded
 */
function pick(obj, keys) {
    if (!obj || typeof obj !== 'object') return {};
    const result = {};
    for (const key of keys) {
        if (obj[key] !== undefined) result[key] = obj[key];
    }
    return result;
}

module.exports = { isNonEmptyString, sanitizeString, sanitizeEmailSubject, pick };
