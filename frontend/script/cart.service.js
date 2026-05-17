import { fetchWithCsrf } from '../utils/csrf.js';
import { debugError } from '../utils/debug.js';

const API_BASE_URL = "/api/v1/cart";
const GUEST_CART_KEY = "glacy-guest-cart";

function getGuestCart() {
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]"); }
  catch { return []; }
}

function setGuestCart(items) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // QuotaExceededError - silently fail
  }
}

// Get cart from backend (or localStorage for guests)
async function fetchCart() {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "GET",
      credentials: "include",
    });
    if (response.status === 401) return getGuestCart();
    const data = await response.json();
    if (data.success) return data.cart || [];
    return [];
  } catch (error) {
    return getGuestCart();
  }
}

// Add item to cart via backend (or localStorage for guests)
async function addItemToCart(productId, quantity = 1) {
  const fallback = () => {
    const cart = getGuestCart();
    const idx = cart.findIndex(i => (i.productId || i.id) === productId);
    if (idx >= 0) {
      cart[idx].quantity += Number(quantity);
    } else {
      cart.push({ productId, id: productId, name: "", price: 0, quantity: Number(quantity), image: "" });
    }
    setGuestCart(cart);
    return { success: true, cart };
  };

  try {
    const res = await fetchWithCsrf(`${API_BASE_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    const data = await res.json();
    if (res.status === 401) return fallback();
    if (data.success) return { success: true, cart: data.cart || [] };
    return { success: false, message: data.message };
  } catch {
    return fallback();
  }
}

// Update cart item quantity
async function updateCartItem(productId, quantity) {
  const fallback = () => {
    const cart = getGuestCart();
    const item = cart.find(i => (i.productId || i.id) === productId);
    if (item) { item.quantity = Number(quantity); setGuestCart(cart); }
    return { success: true, cart };
  };

  try {
    const res = await fetchWithCsrf(`${API_BASE_URL}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    const data = await res.json();
    if (res.status === 401) return fallback();
    if (data.success) return { success: true, cart: data.cart || [] };
    return { success: false, message: data.message };
  } catch {
    return fallback();
  }
}

// Remove item from cart
async function removeCartItem(productId) {
  const fallback = () => {
    let cart = getGuestCart();
    cart = cart.filter(i => (i.productId || i.id) !== productId);
    setGuestCart(cart);
    return { success: true, cart };
  };

  try {
    const res = await fetchWithCsrf(`${API_BASE_URL}/remove/${productId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (res.status === 401) return fallback();
    if (data.success) return { success: true, cart: data.cart || [] };
    return { success: false, message: data.message };
  } catch {
    return fallback();
  }
}

// Clear entire cart
async function clearCart() {
  const fallback = () => {
    setGuestCart([]);
    return { success: true, cart: [] };
  };

  try {
    const res = await fetchWithCsrf(`${API_BASE_URL}/clear`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (res.status === 401) return fallback();
    if (data.success) return { success: true, cart: data.cart || [] };
    return { success: false, message: data.message };
  } catch {
    return fallback();
  }
}

// Sync guest cart to backend (bulk merge)
async function syncCart(cartItems) {
  try {
    const response = await fetchWithCsrf(`${API_BASE_URL}/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartItems }),
    });
    const data = await response.json();
    if (data.success) {
      return { success: true, cart: data.cart };
    }
    return { success: false, message: data.message };
  } catch (error) {
    debugError("Cart sync error:", error);
    return { success: false, message: "Network error" };
  }
}

export { addItemToCart, clearCart, fetchCart, removeCartItem, syncCart, updateCartItem };
