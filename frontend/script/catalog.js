import { loading } from "../utils/loading.js";
import { errorMessage, emptyMessage } from "../utils/error-message.js";
import { showToast } from "../utils/toast-notification.js";
import { isLoggedIn } from "./auth.js";
import { addItemToCart } from "./cart.service.js";

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
    console.log("Catalog API response status:", response.status);

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    console.log("Catalog API data:", data);

    if (data.success) {
      icecreams = data.products;
      renderCatalog();
    }
  } catch (error) {
    console.error("Error loading ice creams:", error);
    document.getElementById("catalog-grid").innerHTML = errorMessage(
      "Oops! Something went wrong",
      `Error loading ice creams: ${error.message}. Please try again later.`,
    );
  } finally {
    console.log("Some went wrong");
  }
}

function filterProducts(category) {
  currentFilter = category;
  console.log("Filtering by category:", category);
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
            <span class="category-badge">${icecream.category}</span>
            <div class="card-img">
              <img src="${icecream.image.url}" alt="${icecream.name} ice cream" loading="lazy">
            </div>
            <div class="card-contents">
              <h3>${icecream.name}</h3>
              <p>${icecream.description}</p>
              <div class="content-item">
                <span class="card-price">$${icecream.price}/кг</span>
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
            <img src="${icecream.image.url}" alt="${icecream.name} ice cream" loading="lazy">
          </div>
          <div class="modal-details">
            <span class="category-badge">${icecream.category}</span>
            <h2>${icecream.name}</h2>
            <p class="description">${icecream.description}</p>

            <div class="price-section">
              <span class="price">$${icecream.price}</span>
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
              Add to Cart - $${icecream.price * quantity}
            </button>

            <div class="product-info">
              <h3>Product Information</h3>
              <div class="info-item">
                <span class="info-label">Product ID:</span>
                <span class="info-value">#${icecream.id}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Category:</span>
                <span class="info-value">${icecream.category}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Price per kg:</span>
                <span class="info-value">₽${icecream.price}</span>
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
  const totalPrice = selectedIceCream.price * quantity;
  document.querySelector(".add-to-cart-btn").innerHTML = `
          <i class="fa-solid fa-cart-shopping"></i>
          Add to Cart - ₽${totalPrice}
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
