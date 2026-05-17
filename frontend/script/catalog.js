import { loading } from "../utils/loading.js";
import { errorMessage, emptyMessage } from "../utils/error-message.js";
import { showToast } from "../utils/toast-notification.js";
import { addItemToCart } from "./cart.service.js";
import { escapeHtml, escapeAttr } from "../utils/security.js";
import { debugLog, debugError } from "../utils/debug.js";

let icecreams = [];
let currentFilter = "all";
let selectedIceCream = null;
let quantity = 1;

const API_BASE_URL = "/api/v1";

// Load product data
async function loadIcecreams() {
  document.getElementById("catalog-grid").innerHTML = loading(
    "Loading ice cream treats",
  );
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    debugLog("Catalog API status:", response.status);

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    debugLog("Catalog data:", data);

    if (data.success) {
      icecreams = data.products;
      renderCatalog();
    } else {
      document.getElementById("catalog-grid").innerHTML = errorMessage(
        "Oops! Something went wrong",
        data.message || "Failed to load products. Please try again later.",
      );
    }
  } catch (error) {
    debugError("Error loading catalog:", error);
    document.getElementById("catalog-grid").innerHTML = errorMessage(
      "Oops! Something went wrong",
      `Error loading ice creams: ${error.message}. Please try again later.`,
    );
  } finally {
    debugLog("Catalog loaded");
  }
}

function filterProducts(category) {
  currentFilter = category;
  debugLog("Filtering:", category);
  renderCatalog();
}

// Render catalog
function renderCatalog() {
  const catalogGrid = document.getElementById("catalog-grid");
  if (!catalogGrid) return;

  let filteredIcecreams = icecreams;

  if (currentFilter !== "all") {
    filteredIcecreams = icecreams.filter(
      (icecream) => icecream.category.toLowerCase() === currentFilter.toLowerCase(),
    );
  }

  if (!filteredIcecreams || filteredIcecreams.length === 0) {
    catalogGrid.innerHTML = emptyMessage("No ice creams available in this category.");
    return;
  }

  catalogGrid.innerHTML = "";

  filteredIcecreams.forEach((icecream) => {
    const card = document.createElement("div");
    card.className = "ice-cream-card";
    card.dataset.id = icecream.id;

    card.innerHTML = `
            <span class="category-badge">${escapeHtml(icecream.category)}</span>
            <div class="card-img">
              <img src="${escapeAttr(icecream.image?.url || '')}" alt="${escapeAttr(icecream.name)} ice cream" loading="lazy">
            </div>
            <div class="card-contents">
              <h3>${escapeHtml(icecream.name)}</h3>
              <p>${escapeHtml(icecream.description)}</p>
              <div class="content-item">
                <span class="card-price">$${(icecream.price || 0).toFixed(2)}/kg</span>
              </div>
            </div>
          `;

    card.addEventListener("click", () => openModal(icecream));
    catalogGrid.appendChild(card);
  });
}

// Open modal with ice cream details
function openModal(icecream) {
  selectedIceCream = icecream;
  quantity = 1;

  const modalBody = document.getElementById("modal-body");
  modalBody.innerHTML = `
          <div class="modal-image">
            <img src="${escapeAttr(icecream.image?.url || '')}" alt="${escapeAttr(icecream.name)} ice cream" loading="lazy" onerror="this.src='../images/img1.png'">
          </div>
          <div class="modal-details">
            <span class="category-badge">${escapeHtml(icecream.category)}</span>
            <h2>${escapeHtml(icecream.name)}</h2>
            <p class="description">${escapeHtml(icecream.description)}</p>

            <div class="price-section">
              <span class="price">$${(icecream.price || 0).toFixed(2)}</span>
              <span class="price-label">per kg</span>
            </div>

            <div class="quantity-selector">
              <label>Quantity:</label>
              <div class="quantity-controls">
                <button class="quantity-btn" id="decrease-qty">-</button>
                <span class="quantity-value" id="quantity-value">1</span>
                <button class="quantity-btn" id="increase-qty">+</button>
              </div>
            </div>

            <button class="add-to-cart-btn" id="add-to-cart">
              <i class="fa-solid fa-cart-shopping"></i>
              Add to Cart - $${((icecream.price || 0) * quantity).toFixed(2)}
            </button>

            <div class="product-info">
              <h3>Product Information</h3>
              <div class="info-item">
                <span class="info-label">Product ID:</span>
                <span class="info-value">#${escapeHtml(icecream.id)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Category:</span>
                <span class="info-value">${escapeHtml(icecream.category)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Price per kg:</span>
                <span class="info-value">$${(icecream.price || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        `;

  // Add event listeners for quantity controls
  document
    .getElementById("decrease-qty")
    .addEventListener("click", decreaseQuantity);
  document
    .getElementById("increase-qty")
    .addEventListener("click", increaseQuantity);
  document.getElementById("add-to-cart").addEventListener("click", addToCart);

  // Show modal
  document.getElementById("modal-overlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

// Close modal
function closeModal() {
  document.getElementById("modal-overlay").classList.remove("active");
  document.body.style.overflow = "auto";
  selectedIceCream = null;
  quantity = 1;
}

// Quantity controls
function decreaseQuantity() {
  if (quantity > 1) {
    quantity--;
    updateQuantityDisplay();
  }
}

function increaseQuantity() {
  quantity++;
  updateQuantityDisplay();
}

function updateQuantityDisplay() {
  document.getElementById("quantity-value").textContent = quantity;
  const totalPrice = (selectedIceCream.price || 0) * quantity;
  document.querySelector(".add-to-cart-btn").innerHTML = `
          <i class="fa-solid fa-cart-shopping"></i>
          Add to Cart - $${totalPrice.toFixed(2)}
        `;
}

// Add to cart functionality
async function addToCart() {
  if (!selectedIceCream) return;

  const productId = selectedIceCream.id || selectedIceCream._id;
  if (!productId) {
    showToast("Product ID missing", "error");
    return;
  }

  const result = await addItemToCart(productId, quantity);

  if (result.success) {
    showToast(`${selectedIceCream.name} added to cart!`, "success");
    document.dispatchEvent(new CustomEvent("cart-updated"));
    closeModal();
  } else {
    showToast(result.message || "Failed to add to cart", "error");
  }
}

// Filter Product category
function setupFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      const category = button.dataset.category;
      currentFilter = category;
      filterProducts(category);
    });
  });
}

// Event listeners
document.getElementById("modal-close").addEventListener("click", closeModal);

document.getElementById("modal-overlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("modal-overlay")) {
    closeModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    document.getElementById("modal-overlay").classList.contains("active")
  ) {
    closeModal();
  }
});

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  await loadIcecreams();
  setupFilter();
});

