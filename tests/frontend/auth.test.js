import { describe, it, expect, beforeEach, vi } from 'vitest';

beforeEach(() => {
  const store = {};
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((index) => Object.keys(store)[index] ?? null),
  });
});

describe('isLoggedIn logic', () => {
  let currentUser = null;
  let authChecked = false;

  function isLoggedIn() {
    if (!authChecked) return false;
    return currentUser !== null;
  }

  beforeEach(() => {
    currentUser = null;
    authChecked = false;
  });

  it('should return false when auth not initialized', () => {
    expect(isLoggedIn()).toBe(false);
  });

  it('should return false when auth checked but no user', () => {
    authChecked = true;
    currentUser = null;
    expect(isLoggedIn()).toBe(false);
  });

  it('should return true when user is logged in', () => {
    authChecked = true;
    currentUser = { id: '1', name: 'Test', email: 'test@example.com' };
    expect(isLoggedIn()).toBe(true);
  });
});

describe('localStorage user data', () => {
  it('should store and retrieve user data', () => {
    const user = { id: '1', name: 'Test User', email: 'test@test.com' };
    localStorage.setItem('glacy-current-user', JSON.stringify(user));
    const stored = JSON.parse(localStorage.getItem('glacy-current-user'));
    expect(stored.name).toBe('Test User');
    expect(stored.email).toBe('test@test.com');
  });

  it('should remove user data on logout', () => {
    localStorage.setItem('glacy-current-user', JSON.stringify({ name: 'Test' }));
    localStorage.removeItem('glacy-current-user');
    expect(localStorage.getItem('glacy-current-user')).toBeNull();
  });
});

describe('guest cart storage', () => {
  const GUEST_CART_KEY = 'glacy-guest-cart';

  function getGuestCart() {
    try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]'); }
    catch { return []; }
  }

  function setGuestCart(items) {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  }

  it('should return empty array when no guest cart exists', () => {
    expect(getGuestCart()).toEqual([]);
  });

  it('should store and retrieve guest cart items', () => {
    const items = [{ productId: '123', quantity: 2 }];
    setGuestCart(items);
    expect(getGuestCart()).toEqual([{ productId: '123', quantity: 2 }]);
  });

  it('should handle corrupted JSON gracefully', () => {
    localStorage.setItem(GUEST_CART_KEY, '{invalid}');
    expect(getGuestCart()).toEqual([]);
  });
});
