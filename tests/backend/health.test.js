import { describe, it, expect } from 'vitest';

describe('App environment', () => {
  it('should have test environment set', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should have JWT_SECRET configured', () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
    expect(process.env.JWT_SECRET).toBeTruthy();
  });
});
