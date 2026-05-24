import { describe, it, expect } from 'vitest';

describe('Cart logic', () => {
  function createCart() {
    return [];
  }

  function addItem(cart, productId, name, price, quantity, image = '') {
    const existing = cart.find(
      (i) => (i.productId || i.id) === productId
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, id: productId, name, price, quantity, image });
    }
    return cart;
  }

  function removeItem(cart, productId) {
    return cart.filter((i) => (i.productId || i.id) !== productId);
  }

  function updateQuantity(cart, productId, quantity) {
    const item = cart.find((i) => (i.productId || i.id) === productId);
    if (item) item.quantity = quantity;
    return cart;
  }

  function getTotal(cart) {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  it('should start with an empty cart', () => {
    const cart = createCart();
    expect(cart).toEqual([]);
  });

  it('should add an item to cart', () => {
    const cart = createCart();
    addItem(cart, 'product-1', 'Vanilla', 4.99, 2);
    expect(cart).toHaveLength(1);
    expect(cart[0].name).toBe('Vanilla');
    expect(cart[0].quantity).toBe(2);
  });

  it('should increase quantity when adding existing item', () => {
    const cart = createCart();
    addItem(cart, 'p1', 'Item', 5, 1);
    addItem(cart, 'p1', 'Item', 5, 3);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(4);
  });

  it('should update item quantity', () => {
    const cart = createCart();
    addItem(cart, 'p1', 'Item', 5, 1);
    updateQuantity(cart, 'p1', 5);
    expect(cart[0].quantity).toBe(5);
  });

  it('should remove an item from cart', () => {
    const cart = createCart();
    addItem(cart, 'p1', 'Item 1', 5, 1);
    addItem(cart, 'p2', 'Item 2', 3, 2);
    const updated = removeItem(cart, 'p1');
    expect(updated).toHaveLength(1);
    expect(updated[0].name).toBe('Item 2');
  });

  it('should calculate cart total', () => {
    const cart = createCart();
    addItem(cart, 'p1', 'Item 1', 5, 2);
    addItem(cart, 'p2', 'Item 2', 3, 3);
    expect(getTotal(cart)).toBe(19);
  });

  it('should return zero for empty cart total', () => {
    expect(getTotal([])).toBe(0);
  });
});
