import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeEmailSubject, sanitizeUrl } from '../sanitize';

describe('sanitizeText', () => {
  it('strips HTML tags', () => {
    expect(sanitizeText('hello <script>alert(1)</script> world')).toBe('hello alert(1) world');
  });

  it('strips control characters', () => {
    expect(sanitizeText('test\x00\x01\x02value')).toBe('testvalue');
  });

  it('preserves newlines and tabs', () => {
    expect(sanitizeText('line1\nline2\ttab')).toBe('line1\nline2\ttab');
  });

  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('handles empty input', () => {
    expect(sanitizeText('')).toBe('');
  });

  it('strips nested tags', () => {
    expect(sanitizeText('<div><img src=x onerror=alert(1)></div>')).toBe('');
  });

  it('strips carriage returns', () => {
    expect(sanitizeText('line1\r\nline2')).toBe('line1\nline2');
    expect(sanitizeText('before\rafter')).toBe('beforeafter');
  });
});

describe('sanitizeEmailSubject', () => {
  it('strips all control characters including newlines and tabs', () => {
    expect(sanitizeEmailSubject('before\r\nafter')).toBe('beforeafter');
    expect(sanitizeEmailSubject('before\tafter')).toBe('beforeafter');
  });

  it('blocks CRLF header injection', () => {
    const malicious = 'Legit\r\nBCC: attacker@evil.com\r\n\r\nFake body';
    expect(sanitizeEmailSubject(malicious)).toBe('LegitBCC: attacker@evil.comFake body');
  });

  it('strips HTML tags', () => {
    expect(sanitizeEmailSubject('<b>bold</b> subject')).toBe('bold subject');
  });

  it('trims whitespace', () => {
    expect(sanitizeEmailSubject('  subject  ')).toBe('subject');
  });

  it('handles empty input', () => {
    expect(sanitizeEmailSubject('')).toBe('');
  });
});

describe('sanitizeUrl', () => {
  it('allows https URLs', () => {
    expect(sanitizeUrl('https://example.com/path')).toBe('https://example.com/path');
  });

  it('blocks javascript: protocol', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
  });

  it('blocks data: protocol', () => {
    expect(sanitizeUrl('data:text/html,<h1>hi</h1>')).toBe('');
  });

  it('blocks http URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('');
  });

  it('blocks empty strings', () => {
    expect(sanitizeUrl('')).toBe('');
  });

  it('trims whitespace around valid URLs', () => {
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
  });
});
