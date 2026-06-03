import { showToast } from '../utils/toast-notification.js';
import { fetchCart, removeCartItem, updateCartItem } from './cart.service.js';
import { createOrder } from './order.service.js';
import { debugError } from '../utils/debug.js';
import { loading } from '../utils/loading.js';

let cartItems = [];
let currentStep = 1;

const $ = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', async () => {
  await loadCart();
  setupPaymentToggle();
  setupNavigation();
});

// ===================== CART LOADING =====================

async function loadCart() {
  $('cart-items-list').innerHTML = loading("Loading your cart...");

  cartItems = await fetchCart();

  if (!cartItems || cartItems.length === 0) {
    $('cart-items-list').innerHTML = '';
    $('empty-cart-state').classList.remove('visually-hidden');
    document.querySelector('.checkout-progress').style.display = 'none';
    document.querySelector('.checkout-content').style.display = 'none';
    return;
  }

  renderCartItems();
  updateSummary();
  $('to-step-2').disabled = false;
}

function renderCartItems() {
  const container = $('cart-items-list');
  container.innerHTML = '';

  cartItems.forEach(item => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    const imageUrl = item.image?.url || item.image || '../images/img1.png';
    const productId = item.productId || item.id;

    const row = document.createElement('div');
    row.className = 'cart-item-row';
    row.dataset.productId = productId;
    row.innerHTML = `
      <img src="${imageUrl}" alt="${item.name}" class="cart-item-img" onerror="this.src='../images/img1.png'" />
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>$${price.toFixed(2)} / kg</p>
      </div>
      <div class="cart-item-qty">
        <button class="qty-minus" data-id="${productId}">-</button>
        <span>${item.quantity}</span>
        <button class="qty-plus" data-id="${productId}">+</button>
      </div>
      <span class="cart-item-price">$${(price * item.quantity).toFixed(2)}</span>
      <button class="cart-item-remove" data-id="${productId}" title="Remove">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    container.appendChild(row);
  });

  // Event listeners
  container.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, -1));
  });
  container.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, 1));
  });
  container.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeItem(btn.dataset.id));
  });
}

async function changeQty(productId, delta) {
  const item = cartItems.find(i => (i.productId || i.id) === productId);
  if (!item) return;

  const newQty = item.quantity + delta;
  if (newQty < 1) return;

  item.quantity = newQty;
  await updateCartItem(productId, newQty);
  renderCartItems();
  updateSummary();
}

async function removeItem(productId) {
  await removeCartItem(productId);
  cartItems = cartItems.filter(i => (i.productId || i.id) !== productId);
  renderCartItems();
  updateSummary();

  if (cartItems.length === 0) {
    $('empty-cart-state').classList.remove('visually-hidden');
    document.querySelector('.checkout-progress').style.display = 'none';
    document.querySelector('.checkout-content').style.display = 'none';
  }
}

function updateSummary() {
  const subtotal = cartItems.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    return sum + price * item.quantity;
  }, 0);

  const summaryItems = $('summary-items');
  summaryItems.innerHTML = cartItems.map(item => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    return `<div class="summary-item"><span>${item.name} x${item.quantity}</span><span>$${(price * item.quantity).toFixed(2)}</span></div>`;
  }).join('');

  $('summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  $('summary-total').textContent = `$${subtotal.toFixed(2)}`;
}

// ===================== STEP NAVIGATION =====================

function setupNavigation() {
  $('to-step-2').addEventListener('click', () => goToStep(2));
  $('back-to-1').addEventListener('click', () => goToStep(1));
  $('to-step-3').addEventListener('click', () => {
    if (validateShipping()) goToStep(3);
  });
  $('back-to-2').addEventListener('click', () => goToStep(2));
  $('place-order').addEventListener('click', handlePlaceOrder);
}

function goToStep(step) {
  // Validate before moving forward
  if (step > currentStep) {
    if (currentStep === 1 && cartItems.length === 0) return;
    if (currentStep === 2 && !validateShipping()) return;
  }

  currentStep = step;

  // Update step sections
  document.querySelectorAll('.checkout-step').forEach(s => s.classList.remove('active'));
  $(`step-${step}`).classList.add('active');

  // Update progress bar
  document.querySelectorAll('.progress-step').forEach(s => {
    const sNum = parseInt(s.dataset.step);
    s.classList.remove('active', 'done');
    if (sNum === step) s.classList.add('active');
    else if (sNum < step) s.classList.add('done');
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateShipping() {
  const name = $('ship-name').value.trim();
  const address = $('ship-address').value.trim();
  const city = $('ship-city').value.trim();
  const zip = $('ship-zip').value.trim();

  if (!name) { showToast('Please enter your name', 'error'); $('ship-name').focus(); return false; }
  if (!address) { showToast('Please enter your address', 'error'); $('ship-address').focus(); return false; }
  if (!city) { showToast('Please enter your city', 'error'); $('ship-city').focus(); return false; }
  if (!zip) { showToast('Please enter your ZIP code', 'error'); $('ship-zip').focus(); return false; }

  return true;
}

// ===================== PAYMENT =====================

function setupPaymentToggle() {
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input').checked = true;
    });
  });
}

// ===================== ORDER PLACEMENT =====================

async function handlePlaceOrder() {
  const btn = $('place-order');
  if (btn.classList.contains('loading')) return;

  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cash';
  const address = [
    $('ship-address').value.trim(),
    $('ship-city').value.trim(),
    $('ship-zip').value.trim(),
  ].filter(Boolean).join(', ');

  btn.classList.add('loading');

  try {
    const data = await createOrder({
      paymentMethod,
      shippingAddress: {
        address,
        phone: $('ship-phone').value.trim() || '',
      },
    });

    $('order-number').textContent = `Order #${data.order.orderNumber}`;
    goToStep(4);

    showToast('Order placed successfully!', 'success');
  } catch (err) {
    debugError('Order error:', err);
    showToast(err.message || 'Failed to place order', 'error');
  } finally {
    btn.classList.remove('loading');
  }
}
