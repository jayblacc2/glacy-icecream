const API_BASE_URL = "/api/v1/cart";

// Get cart from backend
async function fetchCart() {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    if (data.success) {
      return data.cart || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
}

// Add item to cart via backend
async function addItemToCart(productId, quantity = 1) {
  try {
    const response = await fetch(`${API_BASE_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId, quantity }),
    });
    const data = await response.json();
    if (data.success) {
      return { success: true, cart: data.cart };
    }
    return { success: false, message: data.message };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, message: "Network error" };
  }
}

// Update cart item quantity
async function updateCartItem(productId, quantity) {
  try {
    const response = await fetch(`${API_BASE_URL}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId, quantity }),
    });
    const data = await response.json();
    if (data.success) {
      return { success: true, cart: data.cart };
    }
    return { success: false, message: data.message };
  } catch (error) {
    console.error("Error updating cart:", error);
    return { success: false, message: "Network error" };
  }
}

// Remove item from cart
async function removeCartItem(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/remove/${productId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await response.json();
    if (data.success) {
      return { success: true, cart: data.cart };
    }
    return { success: false, message: data.message };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { success: false, message: "Network error" };
  }
}

// Clear entire cart
async function clearCart() {
  try {
    const response = await fetch(`${API_BASE_URL}/clear`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await response.json();
    if (data.success) {
      return { success: true, cart: data.cart };
    }
    return { success: false, message: data.message };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, message: "Network error" };
  }
}

// Sync guest cart to backend (bulk merge)
async function syncCart(cartItems) {
  try {
    const response = await fetch(`${API_BASE_URL}/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ items: cartItems }),
    });
    const data = await response.json();
    if (data.success) {
      return { success: true, cart: data.cart };
    }
    return { success: false, message: data.message };
  } catch (error) {
    console.error("Error syncing cart:", error);
    return { success: false, message: "Network error" };
  }
}

export { addItemToCart, clearCart, fetchCart, removeCartItem, syncCart, updateCartItem };
