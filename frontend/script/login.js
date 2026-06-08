import { showToast } from '../utils/toast-notification.js';
import { fetchWithCsrf } from '../utils/csrf.js';
import { debugError } from '../utils/debug.js';

const API_BASE = '/api/v1/users';

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.login-tab');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const errorBox = document.getElementById('login-error');

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  document.querySelectorAll('.switch-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  function switchTab(tab) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    if (tab === 'login') {
      loginForm.classList.remove('visually-hidden');
      signupForm.classList.add('visually-hidden');
    } else {
      loginForm.classList.add('visually-hidden');
      signupForm.classList.remove('visually-hidden');
    }
    hideError();
  }

  // Password visibility toggle
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      const icon = btn.querySelector('i');
      if (target.type === 'password') {
        target.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        target.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });

  // Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    const btn = document.getElementById('login-submit');
    setLoading(btn, true);

    try {
      const res = await fetchWithCsrf(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      showToast('Login successful!', 'success');

      // Sync guest cart if any
      await syncGuestCart();

      // Redirect
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '../index.html';
      window.location.href = redirect;
    } catch (err) {
      debugError('Login error:', err);
      showError(err.message);
    } finally {
      setLoading(btn, false);
    }
  });

  // Signup
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;

    if (!name || !email || !password || !confirm) {
      showError('Please fill in all fields');
      return;
    }

    if (password !== confirm) {
      showError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    const btn = document.getElementById('signup-submit');
    setLoading(btn, true);

    try {
      const res = await fetchWithCsrf(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      showToast('Account created! Logging you in...', 'success');

      // Auto-login after registration
      const loginRes = await fetchWithCsrf(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();
      if (loginRes.ok && loginData.success) {
        await syncGuestCart();
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '../index.html';
        window.location.href = redirect;
      }
    } catch (err) {
      debugError('Signup error:', err);
      showError(err.message);
    } finally {
      setLoading(btn, false);
    }
  });

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('visually-hidden');
  }

  function hideError() {
    errorBox.classList.add('visually-hidden');
    errorBox.textContent = '';
  }

  function setLoading(btn, loading) {
    btn.classList.toggle('loading', loading);
    btn.disabled = loading;
  }

  async function syncGuestCart() {
    try {
      const raw = localStorage.getItem('glacy-guest-cart');
      if (!raw) return;
      const items = JSON.parse(raw);
      if (!Array.isArray(items) || items.length === 0) return;

      await fetchWithCsrf('/api/v1/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      localStorage.removeItem('glacy-guest-cart');
    } catch (_) {
      // Silently fail
    }
  }
});
