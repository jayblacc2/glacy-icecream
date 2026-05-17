import { fetchWithCsrf } from '../utils/csrf.js';
import { debugError } from '../utils/debug.js';

const ORDER_API = '/api/v1/orders';

// Create order (checkout)
async function createOrder(orderData) {
  try {
    const response = await fetchWithCsrf(ORDER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to place order');
    }

    return data;
  } catch (error) {
    debugError("Create order error:", error);
    throw error;
  }
}

// Get user's orders
async function getUserOrders(page = 1, limit = 10) {
  try {
    const response = await fetch(`${ORDER_API}?page=${page}&limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch orders');
    }

    return data;
  } catch (error) {
    debugError("Get orders error:", error);
    throw error;
  }
}

// Get single order details
async function getOrderById(orderId) {
  try {
    const response = await fetch(`${ORDER_API}/${orderId}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch order');
    }

    return data;
  } catch (error) {
    debugError("Get order error:", error);
    throw error;
  }
}

// Cancel order
async function cancelOrder(orderId) {
  try {
    const response = await fetchWithCsrf(`${ORDER_API}/${orderId}/cancel`, {
      method: 'PUT',
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to cancel order');
    }

    return data;
  } catch (error) {
    debugError("Cancel order error:", error);
    throw error;
  }
}

export { createOrder, getUserOrders, getOrderById, cancelOrder };

