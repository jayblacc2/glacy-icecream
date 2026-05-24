import { describe, it, expect } from 'vitest';
import { escapeHtml, escapeAttr } from '../../frontend/utils/security.js';

describe('escapeHtml', () => {
  it('should return empty string for null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('should escape &', () => {
    expect(escapeHtml('&')).toBe('&amp;');
  });

  it('should escape <', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('should escape >', () => {
    expect(escapeHtml('>')).toBe('&gt;');
  });

  it('should escape double quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('should escape single quotes', () => {
    expect(escapeHtml("'test'")).toBe('&#039;test&#039;');
  });

  it('should escape all special characters', () => {
    const input = '<script>alert("xss")</script>';
    const output = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
    expect(escapeHtml(input)).toBe(output);
  });

  it('should leave normal text unchanged', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
});

describe('escapeAttr', () => {
  it('should return empty string for null/undefined', () => {
    expect(escapeAttr(null)).toBe('');
    expect(escapeAttr(undefined)).toBe('');
  });

  it('should escape double quotes', () => {
    expect(escapeAttr('"test"')).toBe('&quot;test&quot;');
  });

  it('should escape single quotes', () => {
    expect(escapeAttr("'test'")).toBe('&#039;test&#039;');
  });

  it('should escape < and >', () => {
    expect(escapeAttr('<div>')).toBe('&lt;div&gt;');
  });

  it('should leave normal text unchanged', () => {
    expect(escapeAttr('hello-world')).toBe('hello-world');
  });
});
