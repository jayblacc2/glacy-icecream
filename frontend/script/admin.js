import { showToast } from '../utils/toast-notification.js';
import { getCurrentUser, getAuthInitPromise } from './auth.js';
import { fetchWithCsrf } from '../utils/csrf.js';

const API_PRODUCTS = '/api/v1/products';
const API_POSTS = '/api/v1/posts';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let editingId = null;
let editingType = null;

document.addEventListener('DOMContentLoaded', async () => {
  await getAuthInitPromise();
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    showToast('Access denied. Admins only.', 'error');
    setTimeout(() => window.location.href = '../index.html', 1500);
    return;
  }

  setupTabNav();
  setupModal();
  loadProducts();
  loadPosts();
  loadOrders();

  $('btn-add-product').addEventListener('click', () => openForm('product'));
  $('btn-add-post').addEventListener('click', () => openForm('post'));
});

function setupTabNav() {
  $$('.admin-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.admin-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      $$('.tab-panel').forEach(p => p.classList.remove('active'));
      const panel = $(`panel-${btn.dataset.tab}`);
      if (panel) panel.classList.add('active');
    });
  });
}

// ===== MODAL =====
function setupModal() {
  const overlay = $('admin-modal');
  overlay.querySelector('.admin-modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
}

function openModal(title) {
  $('modal-title').textContent = title;
  $('admin-modal').classList.remove('visually-hidden');
}

function closeModal() {
  $('admin-modal').classList.add('visually-hidden');
  editingId = null;
  editingType = null;
}

// ===== PRODUCTS =====
async function loadProducts() {
  const container = $('products-container');
  container.innerHTML = `<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> <p>Loading products...</p></div>`;

  try {
    const res = await fetch(API_PRODUCTS);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const products = data.products || [];
    if (products.length === 0) {
      container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-box-open"></i><h3>No products yet</h3><p>Add your first product to get started.</p></div>`;
      return;
    }

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td><img src="${escapeAttr(p.image?.url || '../images/img1.png')}" alt="" class="thumb" onerror="this.src='../images/img1.png'"></td>
              <td><strong>${escapeHtml(p.name)}</strong></td>
              <td><span class="category-badge">${escapeHtml(p.category)}</span></td>
              <td class="price-cell">$${p.price.toFixed(2)}</td>
              <td class="actions">
                <button class="admin-btn-secondary" onclick="editProduct('${escapeAttr(p._id || p.id)}')"><i class="fa-solid fa-pen"></i></button>
                <button class="admin-btn-danger" onclick="deleteProduct('${escapeAttr(p._id || p.id)}')"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  } catch (err) {
    container.innerHTML = `<div class="error-state"><i class="fa-solid fa-triangle-exclamation"></i><p>${err.message}</p><button class="admin-btn-secondary" onclick="loadProducts()">Retry</button></div>`;
  }
}

window.editProduct = async function(id) {
  try {
    const res = await fetch(`${API_PRODUCTS}/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    openForm('product', data.product);
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.deleteProduct = async function(id) {
  if (!confirm('Delete this product permanently?')) return;
  try {
    const res = await fetchWithCsrf(`${API_PRODUCTS}/delete/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    showToast('Product deleted', 'success');
    loadProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ===== POSTS =====
async function loadPosts() {
  const container = $('posts-container');
  container.innerHTML = `<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> <p>Loading posts...</p></div>`;

  try {
    const res = await fetch(API_POSTS);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const posts = data.posts || [];
    if (posts.length === 0) {
      container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-newspaper"></i><h3>No posts yet</h3><p>Write your first blog post.</p></div>`;
      return;
    }

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${posts.map(post => `
            <tr>
              <td><strong>${escapeHtml(post.title)}</strong></td>
              <td>${escapeHtml(post.author || 'Anonymous')}</td>
              <td style="color: var(--admin-text-muted); font-size: 0.9rem;">${new Date(post.createdAt).toLocaleDateString()}</td>
              <td class="actions">
                <button class="admin-btn-secondary" onclick="editPost('${escapeAttr(post._id || post.id)}')"><i class="fa-solid fa-pen"></i></button>
                <button class="admin-btn-danger" onclick="deletePost('${escapeAttr(post._id || post.id)}')"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  } catch (err) {
    container.innerHTML = `<div class="error-state"><i class="fa-solid fa-triangle-exclamation"></i><p>${err.message}</p><button class="admin-btn-secondary" onclick="loadPosts()">Retry</button></div>`;
  }
}

window.editPost = async function(id) {
  try {
    const res = await fetch(`${API_POSTS}/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    openForm('post', data.post);
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.deletePost = async function(id) {
  if (!confirm('Delete this post permanently?')) return;
  try {
    const res = await fetchWithCsrf(`${API_POSTS}/delete/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    showToast('Post deleted', 'success');
    loadPosts();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ===== ORDERS =====
async function loadOrders() {
  const container = $('orders-container');
  container.innerHTML = `<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> <p>Loading orders...</p></div>`;

  try {
    const res = await fetch('/api/v1/orders/admin', { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const orders = data.orders || [];
    if (orders.length === 0) {
      container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-box-open"></i><h3>No orders yet</h3></div>`;
      return;
    }

    const statusColors = { pending: { bg: '#fef3c7', color: '#92400e' }, processing: { bg: '#dbeafe', color: '#1e40af' }, shipped: { bg: '#d1fae5', color: '#065f46' }, delivered: { bg: '#d1fae5', color: '#065f46' }, cancelled: { bg: '#fee2e2', color: '#991b1b' } };

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(o => {
            const sc = statusColors[o.status] || statusColors.pending;
            return `<tr>
              <td><strong>#${escapeHtml(o.orderNumber)}</strong></td>
              <td>${escapeHtml(o.user ? o.user.name : '—')}</td>
              <td>${o.itemCount}</td>
              <td class="price-cell">$${o.totalAmount.toFixed(2)}</td>
              <td><span class="status-badge" style="background:${sc.bg};color:${sc.color};padding:0.25rem 0.6rem;border-radius:20px;font-size:0.8rem;font-weight:600;">${escapeHtml(o.status)}</span></td>
              <td style="color:var(--admin-text-muted);font-size:0.9rem;">${new Date(o.createdAt).toLocaleDateString()}</td>
              <td class="actions">
                <button class="admin-btn-secondary" onclick="editOrderStatus('${escapeAttr(o.id)}')"><i class="fa-solid fa-pen"></i></button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
  } catch (err) {
    container.innerHTML = `<div class="error-state"><i class="fa-solid fa-triangle-exclamation"></i><p>${err.message}</p><button class="admin-btn-secondary" onclick="loadOrders()">Retry</button></div>`;
  }
}

window.editOrderStatus = async function(id) {
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const current = prompt(`Update order status:\n${statuses.join(', ')}`);
  if (!current || !statuses.includes(current.toLowerCase())) {
    showToast('Invalid status', 'error');
    return;
  }
  try {
    const res = await fetchWithCsrf(`/api/v1/orders/admin/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: current.toLowerCase() }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    showToast('Order status updated', 'success');
    loadOrders();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ===== FORM =====
function openForm(type, item) {
  editingType = type;
  editingId = item ? (item._id || item.id) : null;

  if (type === 'product') {
    openProductForm(item);
  } else {
    openPostForm(item);
  }
}

function openProductForm(product) {
  const isEdit = !!product;
  openModal(isEdit ? 'Edit Product' : 'Add Product');

  $('modal-body').innerHTML = `
    <form class="admin-form" id="item-form">
      <div class="form-group">
        <label for="pf-name">Name</label>
        <input type="text" id="pf-name" value="${isEdit ? escapeHtml(product.name) : ''}" required>
      </div>
      <div class="form-group">
        <label for="pf-desc">Description</label>
        <textarea id="pf-desc" required>${isEdit ? escapeHtml(product.description) : ''}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="pf-price">Price ($)</label>
          <input type="number" id="pf-price" step="0.01" min="0" value="${isEdit ? product.price : ''}" required>
        </div>
        <div class="form-group">
          <label for="pf-category">Category</label>
          <select id="pf-category" required>
            ${['candy','caramel','chocolate','classic','dessert','fruit','nut','mint'].map(c =>
              `<option value="${c}" ${isEdit && product.category === c ? 'selected' : ''}>${c.charAt(0).toUpperCase() + c.slice(1)}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="pf-image">Image URL (optional)</label>
        <input type="url" id="pf-image" value="${isEdit && product.image?.url ? escapeHtml(product.image.url) : ''}" placeholder="https://...">
      </div>
      <div class="form-actions">
        <button type="button" class="btn-cancel" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-submit">${isEdit ? 'Update' : 'Create'}</button>
      </div>
    </form>`;

  $('item-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const imageUrl = $('pf-image').value.trim();
    const body = {
      name: $('pf-name').value.trim(),
      description: $('pf-desc').value.trim(),
      price: parseFloat($('pf-price').value),
      category: $('pf-category').value,
    };
    if (imageUrl) body.image = { url: imageUrl };

    try {
      const url = isEdit ? `${API_PRODUCTS}/update/${editingId}` : `${API_PRODUCTS}/create`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetchWithCsrf(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast(isEdit ? 'Product updated' : 'Product created', 'success');
      closeModal();
      loadProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

function openPostForm(post) {
  const isEdit = !!post;
  openModal(isEdit ? 'Edit Post' : 'Add Post');

  $('modal-body').innerHTML = `
    <form class="admin-form" id="item-form">
      <div class="form-group">
        <label for="pf-title">Title</label>
        <input type="text" id="pf-title" value="${isEdit ? escapeHtml(post.title) : ''}" required>
      </div>
      <div class="form-group">
        <label for="pf-excerpt">Excerpt</label>
        <input type="text" id="pf-excerpt" value="${isEdit ? escapeHtml(post.excerpt) : ''}" required>
      </div>
      <div class="form-group">
        <label for="pf-content">Content</label>
        <textarea id="pf-content" rows="8" required>${isEdit ? escapeHtml(post.content) : ''}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="pf-author">Author</label>
          <input type="text" id="pf-author" value="${isEdit ? escapeHtml(post.author || '') : ''}">
        </div>
        <div class="form-group">
          <label for="pf-featured-image">Featured Image URL</label>
          <input type="url" id="pf-featured-image" value="${isEdit && post.featuredImage ? escapeHtml(post.featuredImage) : ''}" placeholder="https://...">
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-cancel" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-submit">${isEdit ? 'Update' : 'Create'}</button>
      </div>
    </form>`;

  $('item-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      title: $('pf-title').value.trim(),
      excerpt: $('pf-excerpt').value.trim(),
      content: $('pf-content').value.trim(),
      author: $('pf-author').value.trim() || undefined,
      featuredImage: $('pf-featured-image').value.trim() || undefined,
    };

    try {
      const url = isEdit ? `${API_POSTS}/update/${editingId}` : `${API_POSTS}/create`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetchWithCsrf(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast(isEdit ? 'Post updated' : 'Post created', 'success');
      closeModal();
      loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

function escapeHtml(str) {
  if (str == null) return "";
  const s = String(str);
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return s.replace(/[&<>"']/g, (m) => map[m]);
}

function escapeAttr(str) {
  if (str == null) return "";
  return String(str).replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

window.closeModal = closeModal;
