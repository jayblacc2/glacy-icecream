let icecreams = [];
let currentFilter = "all";
let selectedIceCream = null;
let quantity = 1;

// Load ice cream data
async function loadIcecreams() {
  try {
    const response = await fetch("../data/userdb.json");
    const data = await response.json();
    icecreams = data.icecreams;
    renderCatalog();
  } catch (error) {
    console.error("Error loading ice creams:", error);
    document.getElementById("catalog-grid").innerHTML =
      '<div class="loading">Error loading ice creams. Please try again later.</div>';
  }
}

// Render catalog
function renderCatalog() {
  const catalogGrid = document.getElementById("catalog-grid");

  if (!icecreams || icecreams.length === 0) {
    catalogGrid.innerHTML =
      '<div class="loading">No ice creams available.</div>';
    return;
  }

  // Filter ice creams
  const filteredIcecreams =
    currentFilter === "all"
      ? icecreams
      : icecreams.filter((ice) => ice.category === currentFilter);

  if (filteredIcecreams.length === 0) {
    catalogGrid.innerHTML =
      '<div class="loading">No ice creams found in this category.</div>';
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
              <img src="../${icecream.image}" alt="${icecream.name} ice cream" loading="lazy">
            </div>
            <div class="card-contents">
              <h3>${icecream.name}</h3>
              <p>${icecream.description}</p>
              <div class="content-item">
                <span class="card-price">₽${icecream.price}/кг</span>
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
            <img src="../${icecream.image}" alt="${icecream.name} ice cream">
          </div>
          <div class="modal-details">
            <span class="category-badge">${icecream.category}</span>
            <h2>${icecream.name}</h2>
            <p class="description">${icecream.description}</p>

            <div class="price-section">
              <span class="price">₽${icecream.price}</span>
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
              Add to Cart - ₽${icecream.price * quantity}
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
function addToCart() {
  if (!selectedIceCream) return;

  const cartItem = {
    name: selectedIceCream.name,
    price: `₽${selectedIceCream.price}`,
    image: selectedIceCream.image,
    quantity: quantity,
  };

  // Get existing cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(
    (item) => item.name === cartItem.name,
  );

  if (existingItemIndex !== -1) {
    // Update quantity if item exists
    cart[existingItemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    cart.push(cartItem);
  }

  // Save cart to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Show success message
  showToast(`${selectedIceCream.name} added to cart!`, "success");

  // Close modal
  closeModal();
}

// Toast notification
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.style.cssText = `
          position: fixed;
          top: 2rem;
          right: 2rem;
          background: ${
            type === "success"
              ? "linear-gradient(135deg, #4caf50, #66bb6a)"
              : "linear-gradient(135deg, #ff6b9d, #ff8fab)"
          };
          color: white;
          padding: 1rem 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          z-index: 10000;
          animation: slideIn 0.3s ease;
          font-weight: 600;
        `;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Filter functionality
function setupFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      button.classList.add("active");

      // Update current filter
      currentFilter = button.dataset.category;

      // Re-render catalog
      renderCatalog();
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

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
document.head.appendChild(style);

// Initialize
loadIcecreams();
setupFilters();
