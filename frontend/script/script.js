import { createAuthForms } from "../utils/auth-form.js";
import {
  getAuthInitPromise,
  getCurrentUser,
  getUserCart,
  isLoggedIn,
  login,
  logout,
  registerUser,
  updateUserCart,
} from "./auth.js";

let cartItems = [];
let icecreams = [];

// ========================
// LOAD DATA
// ========================
async function loadIcecreams() {
  try {
    const response = await fetch("data/userdb.json");
    const data = await response.json();
    icecreams = data.icecreams || [];
  } catch (error) {
    console.error("Error loading icecreams:", error);
    icecreams = [];
  }
}

// ========================
// CATALOG RENDERING
// ========================
function renderCatalog() {
  const catalogContainer = document.getElementById("catalog-cards");
  if (!catalogContainer) return;

  catalogContainer.innerHTML = "";

  icecreams.forEach((icecream) => {
    const cardElement = document.createElement("div");
    cardElement.className = "card py-1 text-center";

    cardElement.innerHTML = `
      <div class="card-img">
        <img src="${icecream.image}" alt="${icecream.name} ice cream" loading="lazy">
      </div>
      <div class="card-contents">
        <h3 class="text-lg">${icecream.name}</h3>
        <p>${icecream.description}</p>
        <div class="content-item">
          <span class="card-price">${icecream.price}₽/кг</span>
          <span class="card-cart">
            <i class="fa-solid fa-cart-shopping"></i>
          </span>
        </div>
      </div>
    `;

    catalogContainer.appendChild(cardElement);
  });

  attachCartListeners();
}

// ========================
// CART FUNCTIONALITY
// ========================
function attachCartListeners() {
  const cardCartButtons = document.querySelectorAll(".card-cart");
  cardCartButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const selectedCard = e.target.closest(".card");
      const itemName = selectedCard.querySelector("h3")?.textContent || "";
      const itemPrice =
        selectedCard.querySelector(".card-price")?.textContent || "";
      const itemImage = selectedCard.querySelector(".card-img img")?.src || "";

      const cartItem = {
        name: itemName,
        price: itemPrice,
        image: itemImage,
        quantity: 1,
      };

      const existingItem = cartItems.find((item) => item.name === itemName);
      if (existingItem) {
        existingItem.quantity++;
        showToast(`Added another ${itemName} to cart!`);
      } else {
        cartItems.push(cartItem);
        showToast(`${itemName} added to cart!`);
      }

      updateCart();
      saveCart();
    });
  });
}

// ========================
// CART EVENT DELEGATION - FIX FOR QUANTITY BUTTONS
// ========================
function setupCartEventDelegation() {
  const cartItemsContainer = document.querySelector(".cart-items");

  if (!cartItemsContainer) return;

  // Use event delegation for dynamically added buttons
  cartItemsContainer.addEventListener("click", (e) => {
    const target = e.target;

    // Increase quantity
    if (target.classList.contains("increase-qty")) {
      const index = parseInt(target.dataset.index);
      if (cartItems[index]) {
        cartItems[index].quantity++;
        updateCart();
        saveCart();
      }
    }

    // Decrease quantity
    if (target.classList.contains("decrease-qty")) {
      const index = parseInt(target.dataset.index);
      if (cartItems[index]) {
        if (cartItems[index].quantity > 1) {
          cartItems[index].quantity--;
        } else {
          // Remove item if quantity becomes 0
          cartItems.splice(index, 1);
        }
        updateCart();
        saveCart();
      }
    }

    // Remove item
    if (target.classList.contains("remove-item")) {
      const index = parseInt(target.dataset.index);
      if (cartItems[index]) {
        const itemName = cartItems[index].name;
        cartItems.splice(index, 1);
        updateCart();
        saveCart();
        showToast(`${itemName} removed from cart`);
      }
    }
  });
}

function loadCart() {
  if (isLoggedIn()) {
    cartItems = getUserCart();
  } else {
    const savedCart = localStorage.getItem("glacy-guest-cart");
    if (savedCart) {
      cartItems = JSON.parse(savedCart);
    }
  }
  updateCart();
}

function saveCart() {
  if (isLoggedIn()) {
    updateUserCart(cartItems);
  } else {
    localStorage.setItem("glacy-guest-cart", JSON.stringify(cartItems));
  }
}

function updateCart() {
  const cartItemsContainer = document.querySelector(".cart-items");
  const totalAmountElement = document.querySelector(".total-amount");
  const cartLabel = document.querySelector(".cart-label");

  if (!cartItemsContainer || !totalAmountElement || !cartLabel) return;

  cartItemsContainer.innerHTML = "";

  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="empty-cart-message">Your cart is empty</p>';
    totalAmountElement.textContent = "₽0";
    cartLabel.textContent = "Empty";
    return;
  }

  let total = 0;
  cartItems.forEach((item, index) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.className = "cart-item";

    const priceMatch = item.price.match(/\d+/);
    const itemPrice = priceMatch ? parseInt(priceMatch[0]) : 0;
    const itemTotal = itemPrice * item.quantity;
    total += itemTotal;

    cartItemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${item.price}</p>
      </div>
      <div class="cart-item-controls">
        <button class="decrease-qty" data-index="${index}" aria-label="Decrease quantity">-</button>
        <span class="cart-item-quantity">${item.quantity}</span>
        <button class="increase-qty" data-index="${index}" aria-label="Increase quantity">+</button>
        <button class="remove-item" data-index="${index}" aria-label="Remove item">×</button>
      </div>
    `;

    cartItemsContainer.appendChild(cartItemElement);
  });

  totalAmountElement.textContent = `₽${total}`;
  cartLabel.textContent = `${cartItems.length} item${
    cartItems.length > 1 ? "s" : ""
  }`;

  const checkoutBtn = document.querySelector(".checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.onclick = handleCheckout;
  }
}

function handleCheckout() {
  if (!isLoggedIn()) {
    alert("Please login to proceed with checkout");
    const loginContainer = document.getElementById("login-container");
    loginContainer.classList.remove("visually-hidden");
    return;
  }

  const totalAmount = document.querySelector(".total-amount").textContent;
  alert(
    `Checkout for ${cartItems.length} items. Total: ${totalAmount}\n\nOrder placed successfully!`
  );

  cartItems = [];
  updateCart();
  saveCart();

  const cartContainer = document.getElementById("cart-container");
  cartContainer.classList.add("visually-hidden");
}

// ========================
// TOAST NOTIFICATIONS
// ========================
function showToast(message) {
  // Remove existing toast if any
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add("show"), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ========================
// MOBILE MENU - FIX
// ========================
function setupMobileMenu() {
  const burgerMenu = document.getElementById("burger-menu");
  const mobileSidebar = document.getElementById("mobile-sidebar");
  const sidebarClose = document.getElementById("sidebar-close");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  const sidebarLinks = document.querySelectorAll(".sidebar-link");

  // Sidebar buttons
  const sidebarSearch = document.getElementById("sidebar-search");
  const sidebarLogin = document.getElementById("sidebar-login");
  const sidebarCart = document.getElementById("sidebar-cart");

  if (!burgerMenu || !mobileSidebar) return;

  // Open sidebar
  burgerMenu.addEventListener("click", () => {
    mobileSidebar.classList.add("active");
    sidebarOverlay.classList.add("active");
    // burgerMenu.classList.add("active"); // Removed - keep burger as menu icon
    document.body.style.overflow = "hidden";
  });

  // Close sidebar
  const closeSidebar = () => {
    mobileSidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    // burgerMenu.classList.remove("active"); // Removed - keep burger as menu icon
    document.body.style.overflow = "";
  };

  if (sidebarClose) {
    sidebarClose.addEventListener("click", closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  // Close sidebar when clicking links
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", closeSidebar);
  });

  // Sidebar action buttons
  if (sidebarSearch) {
    sidebarSearch.addEventListener("click", () => {
      closeSidebar();
      const searchBox = document.querySelector(".search-box");
      searchBox.classList.remove("visually-hidden");
      document.getElementById("search").focus();
    });
  }

  if (sidebarLogin) {
    sidebarLogin.addEventListener("click", () => {
      closeSidebar();
      const loginContainer = document.getElementById("login-container");
      loginContainer.classList.remove("visually-hidden");
    });
  }

  if (sidebarCart) {
    sidebarCart.addEventListener("click", () => {
      closeSidebar();
      const cartContainer = document.getElementById("cart-container");
      cartContainer.classList.remove("visually-hidden");
    });
  }
}

// ========================
// SEARCH FUNCTIONALITY - NEW
// ========================
function setupSearchFunctionality() {
  const searchForm = document.querySelector(".search-form");
  const searchInput = document.getElementById("search");

  if (!searchForm || !searchInput) return;

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) return;

    // Filter ice creams
    const results = icecreams.filter(
      (icecream) =>
        icecream.name.toLowerCase().includes(searchTerm) ||
        icecream.description.toLowerCase().includes(searchTerm) ||
        icecream.category.toLowerCase().includes(searchTerm)
    );

    if (results.length > 0) {
      showToast(
        `Found ${results.length} result${results.length > 1 ? "s" : ""}`
      );
      // Scroll to catalog
      document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });

      // Highlight matching cards
      highlightSearchResults(searchTerm);
    } else {
      showToast("No results found");
    }

    // Close search box
    document.querySelector(".search-box").classList.add("visually-hidden");
    searchInput.value = "";
  });
}

function highlightSearchResults(searchTerm) {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    const description = card.querySelector("p").textContent.toLowerCase();

    if (name.includes(searchTerm) || description.includes(searchTerm)) {
      card.style.border = "2px solid var(--bg-color-1)";
      card.style.transform = "scale(1.02)";

      // Remove highlight after 2 seconds
      setTimeout(() => {
        card.style.border = "";
        card.style.transform = "";
      }, 2000);
    }
  });
}

// ========================
// AUTH FUNCTIONS
// ========================
function updateAuthUI() {
  const loginLabel = document.querySelector(".login-label");

  if (isLoggedIn()) {
    const user = getCurrentUser();
    // Display first name in uppercase
    const displayName = (
      user.name?.split(" ")[0] || user.email.split("@")[0]
    ).toUpperCase();
    loginLabel.textContent = displayName;

    const loginContainer = document.getElementById("login-container");
    loginContainer.innerHTML = `
      <div class="user-profile">
        <h3>Welcome, ${displayName}!</h3>
        <p style="font-size: 1.3rem; color: #666; margin: 10px 0;">You are logged in</p>
        <button class="logout-btn" style="
          background-color: var(--bg-color-1);
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 10px 20px;
          font-size: 1.4rem;
          cursor: pointer;
          width: 100%;
        ">Logout</button>
      </div>
    `;

    const logoutBtn = loginContainer.querySelector(".logout-btn");
    logoutBtn.addEventListener("click", handleLogout);
  } else {
    loginLabel.textContent = "User";
    restoreLoginForms();
  }
}

async function handleLogout() {
  await logout();
  cartItems = [];
  updateCart();
  updateAuthUI();

  const loginContainer = document.getElementById("login-container");
  loginContainer.classList.add("visually-hidden");

  showToast("Logged out successfully");
}

function restoreLoginForms() {
  const loginContainer = document.getElementById("login-container");
  loginContainer.innerHTML = "";
  loginContainer.appendChild(createAuthForms());

  // Reset form cache in form-toggle.js
  if (window.resetFormCache) {
    window.resetFormCache();
  }

  requestAnimationFrame(() => {
    attachFormListeners();
  });
}

function attachFormListeners() {
  const loginForm = document.querySelector(".login-form");
  const signupForm = document.querySelector(".signup-form");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener("submit", handleRegister);
  }

  // Form switching buttons
  const showSignupBtn = document.getElementById("show-signup");
  const showLoginBtn = document.getElementById("show-login");

  if (showSignupBtn && loginForm && signupForm) {
    showSignupBtn.addEventListener("click", (e) => {
      e.preventDefault();
      loginForm.classList.add("visually-hidden");
      signupForm.classList.remove("visually-hidden");
    });
  }

  if (showLoginBtn && loginForm && signupForm) {
    showLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      signupForm.classList.add("visually-hidden");
      loginForm.classList.remove("visually-hidden");
    });
  }
}

function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  login(email, password)
    .then((result) => {
      if (result.success) {
        const guestCart = localStorage.getItem("glacy-guest-cart");
        if (guestCart) {
          const guestItems = JSON.parse(guestCart);
          const userCart = getUserCart();

          guestItems.forEach((guestItem) => {
            const existingItem = userCart.find(
              (item) => item.name === guestItem.name
            );
            if (existingItem) {
              existingItem.quantity += guestItem.quantity;
            } else {
              userCart.push(guestItem);
            }
          });

          cartItems = userCart;
          localStorage.removeItem("glacy-guest-cart");
        } else {
          cartItems = getUserCart();
        }

        saveCart();
        updateCart();
        updateAuthUI();

        const loginContainer = document.getElementById("login-container");
        loginContainer.classList.add("visually-hidden");

        showToast(result.message);
      } else {
        showToast(result.message);
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      showToast("Network error. Please try again.");
    });
}

function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  registerUser(name, email, password, confirmPassword)
    .then((result) => {
      if (result.success) {
        showToast(result.message + " Please login now.");
        setTimeout(() => window.location.reload(), 1000);

        const loginForm = document.querySelector(".login-form");
        const signupForm = document.querySelector(".signup-form");
        signupForm.classList.add("visually-hidden");
        loginForm.classList.remove("visually-hidden");

        document.getElementById("signup-name").value = "";
        document.getElementById("signup-email").value = "";
        document.getElementById("signup-password").value = "";
        document.getElementById("confirm-password").value = "";
      } else {
        showToast(result.message);
      }
    })
    .catch((error) => {
      console.error("Registration error:", error);
      showToast("Network error. Please try again.");
    });
}

// ========================
// HERO SLIDER
// ========================
let slides;
let totalSlides;
let slideIndex = 0;

function updateSlider() {
  if (slides) {
    slides.style.transform = `translateX(-${slideIndex * 100}%)`;
  }
}

function next() {
  slideIndex = (slideIndex + 1) % totalSlides;
  updateSlider();
}

function prev() {
  slideIndex = (slideIndex - 1 + totalSlides) % totalSlides;
  updateSlider();
}

// Auto-play slider
let sliderInterval;
function startSlider() {
  sliderInterval = setInterval(next, 5000);
}

function resetSlider() {
  clearInterval(sliderInterval);
  startSlider();
}

window.next = next;
window.prev = prev;

// ========================
// CATALOG CAROUSEL
// ========================
let catalogIndex = 0;
let catalogCards;
let totalCatalogCards;
let visibleCards = 4;

function getVisibleCards() {
  if (window.innerWidth <= 600) {
    return 1;
  } else if (window.innerWidth <= 900) {
    return 2;
  } else if (window.innerWidth <= 1200) {
    return 3;
  } else {
    return 4;
  }
}

function updateCatalog() {
  if (!catalogCards) return;

  visibleCards = getVisibleCards();
  const slidePercentage = 100 / visibleCards;

  catalogCards.style.transform = `translateX(-${
    catalogIndex * slidePercentage
  }%)`;

  const prevBtn = document.getElementById("catalog-prev");
  const nextBtn = document.getElementById("catalog-next");

  if (prevBtn) {
    prevBtn.disabled = catalogIndex === 0;
    prevBtn.style.opacity = catalogIndex === 0 ? "0.5" : "1";
  }

  if (nextBtn) {
    nextBtn.disabled = catalogIndex >= totalCatalogCards - visibleCards;
    nextBtn.style.opacity =
      catalogIndex >= totalCatalogCards - visibleCards ? "0.5" : "1";
  }
}

function nextCatalog() {
  if (catalogIndex < totalCatalogCards - visibleCards) {
    catalogIndex++;
    updateCatalog();
  }
}

function prevCatalog() {
  if (catalogIndex > 0) {
    catalogIndex--;
    updateCatalog();
  }
}

// ========================
// STICKY NAVIGATION
// ========================
function setupStickyNav() {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  const navHeight = nav.offsetHeight;

  window.addEventListener("scroll", () => {
    if (window.scrollY > navHeight) {
      nav.classList.add("sticky");
    } else {
      nav.classList.remove("sticky");
    }
  });
}

// ========================
// INITIALIZATION
// ========================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🍦 Glacy Store Initializing...");

  // Load data
  await loadIcecreams();
  renderCatalog();

  // Initialize hero slider
  slides = document.querySelector(".slides");
  if (slides) {
    totalSlides = document.querySelectorAll(".slide").length;
    updateSlider();
    startSlider();

    // Pause on hover
    const heroSlide = document.querySelector(".hero-slide");
    if (heroSlide) {
      heroSlide.addEventListener("mouseenter", () =>
        clearInterval(sliderInterval)
      );
      heroSlide.addEventListener("mouseleave", startSlider);
    }
  }

  // Initialize catalog carousel
  catalogCards = document.querySelector("#catalog .cards");
  if (catalogCards) {
    totalCatalogCards = document.querySelectorAll("#catalog .card").length;
    visibleCards = getVisibleCards();
    updateCatalog();

    const prevButton = document.getElementById("catalog-prev");
    const nextButton = document.getElementById("catalog-next");

    if (prevButton) prevButton.addEventListener("click", prevCatalog);
    if (nextButton) nextButton.addEventListener("click", nextCatalog);
  }

  // Setup all functionality
  setupCartEventDelegation(); // CRITICAL FIX - Cart buttons now work!
  setupMobileMenu(); // MOBILE FIX - Burger menu now works!
  setupSearchFunctionality(); // NEW FEATURE - Search now works!
  setupStickyNav();

  // Initialize auth - wait for auth to be initialized first
  await getAuthInitPromise();
  updateAuthUI(); // This will call restoreLoginForms() if not logged in
  loadCart();

  // Handle window resize
  window.addEventListener("resize", updateCatalog);

  console.log("✅ Glacy Store Ready!");
});
