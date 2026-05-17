import { showToast } from '../utils/toast-notification.js';
import { escapeHtml, escapeAttr } from '../utils/security.js';
import { fetchWithCsrf } from '../utils/csrf.js';
import { debugError } from '../utils/debug.js';
import { fetchCart } from './cart.service.js';
import { createOrder, getUserOrders } from './order.service.js';

const API_BASE_URL = '/api/v1/users';

// DOM Elements cache
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// State
let profileData = null;
let originalData = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthAndLoadProfile();
  setupTabNavigation();
  setupPasswordToggle();
  setupFormSubmissions();
  setupPasswordStrength();
  setupPasswordFormToggle();
  setupAvatarUpload();
  updateFooterYear();
  await loadOrders();

  // Auto-switch to orders tab if ?tab=orders is in URL
  const params = new URLSearchParams(window.location.search);
  if (params.get('tab') === 'orders') {
    switchToOrdersTab();
  }
});

// ===== AUTHENTICATION =====
async function checkAuthAndLoadProfile() {
  try {
    const res = await fetch(`${API_BASE_URL}/check-auth`, { credentials: 'include' });
    const data = await res.json();

    if (!data.isLoggedIn) {
      showToast('Please login to view your profile', 'error');
      setTimeout(() => window.location.href = '../index.html', 2000);
      return;
    }

    await loadProfile();
  } catch (err) {
    debugError("Auth check error:", err);
    showToast('Authentication error', 'error');
  }
}

// ===== LOAD PROFILE =====
async function loadProfile() {
  try {
    const res = await fetch(`${API_BASE_URL}/profile`, { credentials: 'include' });
    const data = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load profile');

    profileData = data.user;
    originalData = { name: data.user.name, email: data.user.email };

    updateUI(data.user);
  } catch (err) {
    debugError("Profile load error:", err);
    showToast(err.message, 'error');
  }
}

// ===== UPDATE UI =====
function updateUI(user) {
  // Hero section
  const heroName = $('hero-name');
  const heroRole = $('hero-role');
  if (heroName) heroName.textContent = user.name || 'User';
  if (heroRole) heroRole.innerHTML = `<i class="fa-solid fa-shield-check"></i> ${user.role || 'Member'}`;

  // Avatar
  const avatarEl = document.querySelector('.profile-avatar');
  if (avatarEl) {
    if (user.avatar?.url) {
      avatarEl.innerHTML = `<img src="${user.avatar.url}" alt="${user.name}" class="avatar-img">`;
    } else {
      avatarEl.innerHTML = '<i class="fa-solid fa-user"></i>';
    }
  }

  // Overview cards
  const overviewName = $('overview-name');
  const overviewEmail = $('overview-email');
  const overviewContact = $('overview-contact');
  const overviewRole = $('overview-role');

  if (overviewName) overviewName.textContent = user.name || '--';
  if (overviewEmail) overviewEmail.textContent = user.email || '--';
  if (overviewContact) overviewContact.textContent = user.email || '--';
  if (overviewRole) overviewRole.textContent = user.role === 'admin' ? 'Administrator' : 'Standard';

  // Profile form
  const profileName = $('profile-name');
  const profileEmail = $('profile-email');
  const profileCreated = $('profile-created');

  if (profileName) profileName.value = user.name || '';
  if (profileEmail) profileEmail.value = user.email || '';
  if (profileCreated && user.createdAt) {
    profileCreated.value = new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // Stats
  const statMember = $('stat-member');
  const statOrders = $('stat-orders');
  const statSpent = $('stat-spent');

  if (statMember && user.createdAt) {
    statMember.textContent = new Date(user.createdAt).getFullYear();
  }
  if (statOrders) {
    statOrders.textContent = user.orderCount ?? 0;
  }
  if (statSpent) {
    statSpent.textContent = `$${(user.totalSpent ?? 0).toFixed(2)}`;
  }

  // Calculate profile completion
  updateProfileCompletion(user);

  // Load activity
  loadActivity(user);
}

function updateProfileCompletion(user) {
  let completed = 0;
  const fields = ['name', 'email'];
  fields.forEach(f => { if (user[f]) completed++; });

  const percentage = Math.round((completed / fields.length) * 100);
  const progressBar = $('completion-progress');
  const progressText = $('completion-text');
  const statCompletion = $('stat-completion');

  if (progressBar) progressBar.style.width = `${percentage}%`;
  if (statCompletion) statCompletion.textContent = `${percentage}%`;

  if (progressText) {
    if (percentage === 100) {
      progressText.textContent = 'Your profile is complete! ðŸŽ‰';
    } else {
      progressText.textContent = `Complete your profile for better experience`;
    }
  }
}

// ===== ACTIVITY =====
function loadActivity(user) {
  const activityList = $('activity-list');
  if (!activityList) return;

  const activities = [
    { icon: 'login', text: 'Logged in to your account', time: 'Just now' },
    { icon: 'profile', text: 'Profile information updated', time: user.updatedAt ? timeAgo(user.updatedAt) : 'Never' },
  ];

  if (activities.length === 0 || (activities.length === 1 && activities[0].time === 'Never')) {
    activityList.innerHTML = `
      <div class="activity-empty">
        <p>No recent activity</p>
      </div>
    `;
    return;
  }

  activityList.innerHTML = activities.map(a => `
    <div class="activity-item">
      <div class="activity-icon ${a.icon}"><i class="fa-solid fa-${
        a.icon === 'login' ? 'right-to-bracket' :
        a.icon === 'order' ? 'bag-shopping' :
        a.icon === 'profile' ? 'user-pen' : 'key'
      }"></i></div>
      <div class="activity-content">
        <p>${escapeHtml(a.text)}</p>
        <span class="activity-time">${escapeHtml(a.time)}</span>
      </div>
    </div>
  `).join('');
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

// ===== TAB NAVIGATION =====
function setupTabNavigation() {
  const navItems = $$('.profile-nav-item');
  const panels = $$('.tab-panel');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      panels.forEach(p => p.classList.remove('active'));
      const targetPanel = $(`panel-${targetTab}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

// ===== PASSWORD TOGGLE =====
function setupPasswordToggle() {
  $$('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = $(targetId);
      const icon = btn.querySelector('i');
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });
}

// ===== PASSWORD FORM TOGGLE =====
function setupPasswordFormToggle() {
  const toggleBtn = $('btn-toggle-password');
  const cancelBtn = $('btn-cancel-password');
  const passwordForm = $('password-form');

  if (toggleBtn && passwordForm) {
    toggleBtn.addEventListener('click', () => {
      passwordForm.classList.remove('password-form-hidden');
      passwordForm.classList.add('password-form-visible');
      toggleBtn.style.display = 'none';
    });
  }

  if (cancelBtn && passwordForm) {
    cancelBtn.addEventListener('click', () => {
      passwordForm.classList.remove('password-form-visible');
      passwordForm.classList.add('password-form-hidden');
      if (toggleBtn) toggleBtn.style.display = 'inline-flex';
      passwordForm.reset();
      resetPasswordStrength();
    });
  }
}

// ===== AVATAR UPLOAD =====
function setupAvatarUpload() {
  const editBtn = document.querySelector('.avatar-edit-btn');
  if (!editBtn) return;

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  editBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      fileInput.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    editBtn.disabled = true;
    editBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    try {
      const res = await fetchWithCsrf(`${API_BASE_URL}/avatar`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      // Update avatar in UI
      const avatarEl = document.querySelector('.profile-avatar');
      if (avatarEl && data.avatar?.url) {
        avatarEl.innerHTML = `<img src="${data.avatar.url}" alt="Avatar" class="avatar-img">`;
      }

      // Update currentUser
      if (profileData) profileData.avatar = data.avatar;

      showToast('Avatar updated!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload avatar', 'error');
    } finally {
      editBtn.disabled = false;
      editBtn.innerHTML = '<i class="fa-solid fa-camera"></i>';
      fileInput.value = '';
    }
  });
}

// ===== PASSWORD STRENGTH =====
function setupPasswordStrength() {
  const newPass = $('new-password');
  if (!newPass) return;

  newPass.addEventListener('input', (e) => {
    const val = e.target.value;
    const strength = calculateStrength(val);
    updateStrengthMeter(strength);
  });
}

function calculateStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(4, Math.floor(score / 1.5));
}

function updateStrengthMeter(strength) {
  const segments = $$('.strength-segment');
  const text = $('strength-text');

  segments.forEach((seg, idx) => {
    seg.classList.toggle('active', idx < strength);
  });

  const labels = ['Enter a password', 'Weak', 'Fair', 'Good', 'Strong'];
  if (text) text.textContent = labels[strength];
}

function resetPasswordStrength() {
  const segments = $$('.strength-segment');
  const text = $('strength-text');
  segments.forEach(seg => seg.classList.remove('active'));
  if (text) text.textContent = 'Enter a password';
}

// ===== FORM SUBMISSIONS =====
function setupFormSubmissions() {
  const profileForm = $('profile-form');
  const passwordForm = $('password-form');

  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', handlePasswordChange);
  }

  // Reset button
  const resetBtn = $('btn-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (profileData) {
        $('profile-name').value = originalData.name || '';
        $('profile-email').value = originalData.email || '';
        clearErrors();
      }
    });
  }

  // Delete account button
  const deleteBtn = $('btn-delete-account');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', handleDeleteAccount);
  }
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  clearErrors();

  const name = $('profile-name').value.trim();
  const email = $('profile-email').value.trim();

  if (!name || name.length < 3) {
    showFieldError('name-error', 'Name must be at least 3 characters');
    return;
  }
  if (!isValidEmail(email)) {
    showFieldError('email-error', 'Please enter a valid email');
    return;
  }
  if (name === originalData.name && email === originalData.email) {
    showToast('No changes to save', 'error');
    return;
  }

  const btn = $('btn-save-profile');
  setLoading(btn, true);

  try {
    const res = await fetchWithCsrf(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);

    profileData = data.user;
    originalData = { name, email };
    updateUI(data.user);
    showToast('Profile updated successfully!', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to update profile', 'error');
  } finally {
    setLoading(btn, false);
  }
}

async function handlePasswordChange(e) {
  e.preventDefault();
  clearErrors();

  const current = $('current-password').value;
  const newPass = $('new-password').value;
  const confirm = $('confirm-password').value;

  if (!current) { showFieldError('current-password-error', 'Current password is required'); return; }
  if (newPass.length < 8) { showFieldError('new-password-error', 'Password must be at least 8 characters'); return; }
  if (newPass !== confirm) { showFieldError('confirm-password-error', 'Passwords do not match'); return; }

  const btn = $('btn-save-password');
  setLoading(btn, true);

  try {
    const res = await fetchWithCsrf(`${API_BASE_URL}/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, newPassword: newPass })
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);

    $('password-form').reset();
    $('btn-cancel-password').click();
    showToast('Password changed successfully!', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to change password', 'error');
  } finally {
    setLoading(btn, false);
  }
}

// ===== DELETE ACCOUNT =====
async function handleDeleteAccount() {
  if (!profileData) return;

  const confirmed = confirm(
    'Are you sure you want to delete your account?\n\n' +
    'This action is permanent and cannot be undone. All your data including orders will be lost.'
  );
  if (!confirmed) return;

  const btn = $('btn-delete-account');
  btn.disabled = true;
  btn.textContent = 'Deleting...';

  try {
    const res = await fetchWithCsrf(`${API_BASE_URL}/delete/${profileData.id}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);

    showToast('Account deleted successfully', 'success');
    setTimeout(() => window.location.href = '../index.html', 1500);
  } catch (err) {
    showToast(err.message || 'Failed to delete account', 'error');
    btn.disabled = false;
    btn.textContent = 'Delete Account';
  }
}

// ===== UTILITIES =====
function showFieldError(id, message) {
  const el = $(id);
  if (el) el.textContent = message;
}

function clearErrors() {
  $$('.error-message').forEach(el => el.textContent = '');
}

function setLoading(btn, loading) {
  if (!btn) return;
  btn.classList.toggle('loading', loading);
  btn.disabled = loading;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== ORDERS =====
async function loadOrders(page = 1) {
  const ordersContainer = $('orders-container');
  if (!ordersContainer) return;

  ordersContainer.innerHTML = `
    <div class="loading-state">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>Loading your orders...</p>
    </div>
  `;

  try {
    const data = await getUserOrders(page, 10);

    if (!data.orders || data.orders.length === 0) {
      ordersContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fa-solid fa-box-open"></i>
          </div>
          <h3>No orders yet</h3>
          <p>You haven't placed any orders yet. Start exploring our delicious ice cream collection!</p>
          <a href="catalogs.html" class="btn-primary">
            <i class="fa-solid fa-ice-cream"></i> Browse Catalog
          </a>
        </div>
      `;
      return;
    }

    renderOrders(data.orders, data.pagination);
  } catch (error) {
    debugError("Orders load error:", error);
    ordersContainer.innerHTML = `
      <div class="error-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Failed to load orders. Please try again.</p>
        <button class="btn-secondary" onclick="loadOrders()">Retry</button>
      </div>
    `;
  }
}

function renderOrders(orders, pagination) {
  const ordersContainer = $('orders-container');
  if (!ordersContainer) return;

  const statusColors = {
    'pending': { bg: '#fef3c7', color: '#92400e', text: 'Pending' },
    'processing': { bg: '#dbeafe', color: '#1e40af', text: 'Processing' },
    'shipped': { bg: '#d1fae5', color: '#065f46', text: 'Shipped' },
    'delivered': { bg: '#d1fae5', color: '#065f46', text: 'Delivered' },
    'cancelled': { bg: '#fee2e2', color: '#991b1b', text: 'Cancelled' },
  };

  ordersContainer.innerHTML = `
    <div class="orders-list">
      ${orders.map(order => {
        const status = statusColors[order.status] || statusColors['pending'];
        return `
          <div class="order-card">
            <div class="order-header">
              <div>
                <span class="order-number">#${escapeHtml(order.orderNumber)}</span>
                <span class="order-date">${escapeHtml(new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric'
                }))}</span>
              </div>
              <span class="order-status" style="background: ${status.bg}; color: ${status.color}">
                ${escapeHtml(status.text)}
              </span>
            </div>
            <div class="order-details">
              <div class="order-info">
                <span class="order-items-count">${order.itemCount} item${order.itemCount !== 1 ? 's' : ''}</span>
                <span class="order-total">$${order.totalAmount.toFixed(2)}</span>
              </div>
              <button class="btn-outline btn-small" onclick="viewOrder('${escapeAttr(order.id)}')">
                View Details
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    ${pagination && pagination.pages > 1 ? `
      <div class="pagination">
        ${Array.from({ length: pagination.pages }, (_, i) => `
          <button class="page-btn ${i + 1 === pagination.page ? 'active' : ''}"
                  onclick="loadOrders(${i + 1})">${i + 1}</button>
        `).join('')}
      </div>
    ` : ''}
  `;
}

window.viewOrder = async function(orderId) {
  try {
    const { getOrderById } = await import('./order.service.js');
    const data = await getOrderById(orderId);
    if (!data.success || !data.order) throw new Error('Order not found');

    showOrderModal(data.order);
  } catch (error) {
    showToast(error.message || 'Failed to load order details', 'error');
  }
};

function showOrderModal(order) {
  const existing = document.getElementById('order-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'order-modal';
  modal.className = 'order-modal-overlay';
  modal.innerHTML = `
    <div class="order-modal-content">
      <button class="order-modal-close"><i class="fa-solid fa-xmark"></i></button>
      <h3>Order #${escapeHtml(order.orderNumber)}</h3>
      <div class="order-modal-status" style="margin: 1rem 0; padding: 0.5rem 1rem; border-radius: 8px; display: inline-block; background: ${getStatusBg(order.status)}; color: ${getStatusColor(order.status)}">
        ${escapeHtml(getStatusText(order.status))}
      </div>
      <p style="color: var(--text-muted); font-size: 0.9rem;">
        Placed on ${escapeHtml(new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))}
      </p>
      <div class="order-modal-items" style="margin: 1.5rem 0;">
        ${order.items.map(item => {
          const imgUrl = item.image?.url || item.image || '';
          return `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
              <img src="${escapeAttr(imgUrl)}" alt="${escapeAttr(item.name)}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" onerror="this.src='../images/img1.png'">
              <div style="flex: 1;">
                <strong>${escapeHtml(item.name)}</strong>
                <p style="margin: 0.25rem 0 0; color: var(--text-muted); font-size: 0.9rem;">$${item.price.toFixed(2)} x ${item.quantity}</p>
              </div>
              <span style="font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `;
        }).join('')}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 2px solid var(--border-color);">
        <div>
          <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted);">Payment: ${escapeHtml(order.paymentMethod)}</p>
          ${order.shippingAddress?.address ? `<p style="margin: 0.25rem 0 0; font-size: 0.9rem; color: var(--text-muted);">Deliver to: ${escapeHtml(order.shippingAddress.address)}</p>` : ''}
        </div>
        <span style="font-size: 1.25rem; font-weight: 700;">$${order.totalAmount.toFixed(2)}</span>
      </div>
      ${['pending', 'processing'].includes(order.status) ? `
        <button class="btn-danger" id="cancel-order-btn" style="margin-top: 1.5rem; width: 100%;">
          <i class="fa-solid fa-ban"></i> Cancel Order
        </button>
      ` : ''}
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.order-modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  const cancelBtn = modal.querySelector('#cancel-order-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to cancel this order?')) return;
      cancelBtn.disabled = true;
      cancelBtn.textContent = 'Cancelling...';
      try {
        const { cancelOrder } = await import('./order.service.js');
        const result = await cancelOrder(order.id);
        if (result.success) {
          showToast('Order cancelled', 'success');
          modal.remove();
          loadOrders();
        }
      } catch (error) {
        showToast(error.message || 'Failed to cancel order', 'error');
        cancelBtn.disabled = false;
        cancelBtn.textContent = 'Cancel Order';
      }
    });
  }
}

function getStatusBg(status) {
  const map = { pending: '#fef3c7', processing: '#dbeafe', shipped: '#d1fae5', delivered: '#d1fae5', cancelled: '#fee2e2' };
  return map[status] || '#fef3c7';
}
function getStatusColor(status) {
  const map = { pending: '#92400e', processing: '#1e40af', shipped: '#065f46', delivered: '#065f46', cancelled: '#991b1b' };
  return map[status] || '#92400e';
}
function getStatusText(status) {
  const map = { pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
  return map[status] || status;
}

// Make loadOrders available globally for onclick handlers
window.loadOrders = loadOrders;

function updateFooterYear() {
  const el = $('current-year');
  if (el) el.textContent = new Date().getFullYear();
}

// ===== CART CHECKOUT ON PROFILE PAGE =====

function switchToOrdersTab() {
  const ordersNav = document.querySelector('.profile-nav-item[data-tab="orders"]');
  if (ordersNav) ordersNav.click();
  setTimeout(loadCartCheckout, 500);
}

async function loadCartCheckout() {
  const ordersContainer = $('orders-container');
  if (!ordersContainer) return;

  try {
    const cart = await fetchCart();
    if (!cart || cart.length === 0) return;

    // Insert checkout UI before order history
    const checkoutSection = document.createElement('div');
    checkoutSection.id = 'cart-checkout-section';
    checkoutSection.className = 'cart-checkout-section';
    renderCartCheckout(cart, checkoutSection);
    ordersContainer.parentNode.insertBefore(checkoutSection, ordersContainer);
  } catch (error) {
    debugError("Cart checkout error:", error);
  }
}

function renderCartCheckout(cart, container) {
  let total = 0;

  container.innerHTML = `
    <div class="checkout-header">
      <h3><i class="fa-solid fa-cart-shopping"></i> Cart Checkout</h3>
      <p class="checkout-subtitle">Review your items before placing the order</p>
    </div>
    <div class="checkout-items">
      ${cart.map(item => {
        const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
        const itemTotal = price * item.quantity;
        total += itemTotal;
        const imageUrl = item.image?.url || item.image || '';
        return `
          <div class="checkout-item">
            <img src="${imageUrl}" alt="${item.name}" class="checkout-item-img" onerror="this.src='../images/img1.png'">
            <div class="checkout-item-info">
              <h4>${item.name}</h4>
              <p>$${price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <span class="checkout-item-total">$${itemTotal.toFixed(2)}</span>
          </div>
        `;
      }).join('')}
    </div>
    <div class="checkout-address">
      <h4><i class="fa-solid fa-location-dot"></i> Shipping Address</h4>
      <div class="input-wrapper">
        <div class="input-field">
          <i class="fa-solid fa-map-pin input-icon"></i>
          <input type="text" id="checkout-address" placeholder="Street, city, zip code" required/>
        </div>
      </div>
      <div class="input-wrapper">
        <div class="input-field">
          <i class="fa-solid fa-phone input-icon"></i>
          <input type="text" id="checkout-phone" placeholder="Phone number"/>
        </div>
      </div>
    </div>
    <div class="checkout-footer">
      <div class="checkout-total">
        <span>Total</span>
        <span class="checkout-total-amount">$${total.toFixed(2)}</span>
      </div>
      <button class="btn-primary" id="place-order-btn">
        <i class="fa-solid fa-bag-shopping"></i>
        <span class="btn-text">Place Order</span>
        <span class="btn-loader"><i class="fa-solid fa-circle-notch fa-spin"></i></span>
      </button>
    </div>
  `;

  const placeOrderBtn = container.querySelector('#place-order-btn');
  placeOrderBtn.addEventListener('click', handlePlaceOrder);
}

async function handlePlaceOrder() {
  const btn = $('place-order-btn');
  if (!btn) return;

  const address = $('checkout-address')?.value.trim();
  if (!address) {
    showToast('Please enter a shipping address', 'error');
    $('checkout-address')?.focus();
    return;
  }

  btn.classList.add('loading');
  btn.disabled = true;

  try {
    const data = await createOrder({
      paymentMethod: 'cash',
      shippingAddress: {
        address,
        phone: $('checkout-phone')?.value.trim() || '',
      },
    });
    showToast(`Order placed! #${data.order.orderNumber}`, 'success');

    const section = $('cart-checkout-section');
    if (section) section.remove();

    await Promise.all([loadOrders(), loadProfile()]);
  } catch (error) {
    showToast(error.message || 'Failed to place order', 'error');
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

export { loadProfile, loadOrders };


