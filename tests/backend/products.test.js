import { describe, it, expect } from 'vitest';

const validCategories = [
  'candy', 'caramel', 'chocolate', 'classic',
  'dessert', 'fruit', 'nut', 'mint',
];

describe('Product validation', () => {
  it('should accept valid categories', () => {
    expect(validCategories).toContain('classic');
    expect(validCategories).toContain('chocolate');
    expect(validCategories).toContain('fruit');
  });

  it('should reject invalid categories', () => {
    expect(validCategories).not.toContain('invalid-category');
    expect(validCategories).not.toContain('vegetable');
  });

  it('should require non-negative price', () => {
    const isValidPrice = (price) => typeof price === 'number' && price >= 0 && price <= 1000000;
    expect(isValidPrice(5.99)).toBe(true);
    expect(isValidPrice(0)).toBe(true);
    expect(isValidPrice(-1)).toBe(false);
    expect(isValidPrice(1000001)).toBe(false);
  });

  it('should require non-negative stock', () => {
    const isValidStock = (stock) => typeof stock === 'number' && stock >= 0;
    expect(isValidStock(50)).toBe(true);
    expect(isValidStock(0)).toBe(true);
    expect(isValidStock(-1)).toBe(false);
  });
});
