import {
  register,
  login,
  logout,
  isLoggedIn,
  getCurrentUser,
  updateUserCart,
  getUserCart,
} from "./auth.js";

const cardCart = document.querySelectorAll(".card-cart");

let cartItems = [];
let index = 0;

// Load cart based on authentication status
function loadCart() {
  if (isLoggedIn()) {
    // Load cart from user account
    cartItems = getUserCart();
  } else {
    // Load cart from localStorage (guest cart)
    const savedCart = localStorage.getItem("glacy-guest-cart");
    if (savedCart) {
      cartItems = JSON.parse(savedCart);
    }
  }
  updateCart();
}

// Save cart based on authentication status
function saveCart() {
  if (isLoggedIn()) {
    // Save to user account
    updateUserCart(cartItems);
  } else {
    // Save to guest localStorage
    localStorage.setItem("glacy-guest-cart", JSON.stringify(cartItems));
  }
}

// Update UI based on login status
function updateAuthUI() {
  const loginLabel = document.querySelector(".login-label");

  if (isLoggedIn()) {
    const user = getCurrentUser();
    loginLabel.textContent = user.username;

    // Add logout button to login container
    const loginContainer = document.getElementById("login-container");
    loginContainer.innerHTML = `
      <div class="user-profile">
        <h3>Welcome, ${user.username}!</h3>
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

    // Add logout event listener
    const logoutBtn = loginContainer.querySelector(".logout-btn");
    logoutBtn.addEventListener("click", handleLogout);
  } else {
    loginLabel.textContent = "login";
    // Restore original login/signup forms
    restoreLoginForms();
  }
}

// Handle logout
function handleLogout() {
  logout();
  cartItems = []; // Clear cart on logout
  updateCart();
  updateAuthUI();

  // Close the dropdown
  const loginContainer = document.getElementById("login-container");
  loginContainer.classList.add("visually-hidden");

  alert("You have been logged out successfully");
}

// Restore login forms
function restoreLoginForms() {
  const loginContainer = document.getElementById("login-container");
  loginContainer.innerHTML = `
    <form class="login-form">
      <h3>Sign In</h3>
      <div class="form-control">
        <label for="username">
          <input type="text" id="username" placeholder="Username" class="login-username">
        </label>
      </div>
      <div class="form-control">
        <label for="password">
          <input type="password" id="password" placeholder="Password" class="login-password">
        </label>
      </div>
      <div class="login-btn">
        <button type="submit" class="login-submit">Login</button>
        <a href="#" class="forgot-password">Forgot password?</a>
        <button type="button" class="register-btn" id="show-signup">Register</button>
      </div>
    </form>
    <form class="signup-form visually-hidden">
      <h3>Create Account</h3>
      <div class="form-control">
        <label for="signup-username">
          <input type="text" id="signup-username" placeholder="Username" class="signup-username">
        </label>
      </div>
      <div class="form-control">
        <label for="signup-password">
          <input type="password" id="signup-password" placeholder="Password" class="signup-password">
        </label>
      </div>
      <div class="form-control">
        <label for="confirm-password">
          <input type="password" id="confirm-password" placeholder="Confirm Password" class="confirm-password">
        </label>
      </div>
      <div class="signup-btn">
        <button type="submit" class="signup-submit">Register</button>
      </div>
    </form>
  `;

  // Re-attach form event listeners
  attachFormListeners();
}

// Attach form event listeners
function attachFormListeners() {
  const loginForm = document.querySelector(".login-form");
  const signupForm = document.querySelector(".signup-form");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener("submit", handleRegister);
  }

  // Re-attach toggle listeners
  const showSignupBtn = document.getElementById("show-signup");
  if (showSignupBtn) {
    showSignupBtn.addEventListener("click", (e) => {
      e.preventDefault();
      loginForm.classList.add("visually-hidden");
      signupForm.classList.remove("visually-hidden");
    });
  }
}

// Handle login
function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const result = login(username, password);

  if (result.success) {
    // Merge guest cart with user cart
    const guestCart = localStorage.getItem("glacy-guest-cart");
    if (guestCart) {
      const guestItems = JSON.parse(guestCart);
      const userCart = getUserCart();

      // Merge carts - combine quantities for same items
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

    // Close the dropdown
    const loginContainer = document.getElementById("login-container");
    loginContainer.classList.add("visually-hidden");

    alert(result.message);
  } else {
    alert(result.message);
  }
}

// Handle register
function handleRegister(e) {
  e.preventDefault();

  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  const result = register(username, password, confirmPassword);

  if (result.success) {
    alert(result.message + " Please login now.");

    // Switch to login form
    const loginForm = document.querySelector(".login-form");
    const signupForm = document.querySelector(".signup-form");
    signupForm.classList.add("visually-hidden");
    loginForm.classList.remove("visually-hidden");

    // Clear form
    document.getElementById("signup-username").value = "";
    document.getElementById("signup-password").value = "";
    document.getElementById("confirm-password").value = "";
  } else {
    alert(result.message);
  }
}
let slides;
let totalSlides;

// Hero slider functions
function updateSlider() {
  slides.style.transform = `translateX(-${index * 100}%)`;
}

function next() {
  index = (index + 1) % totalSlides;
  updateSlider();
}

function prev() {
  index = (index - 1 + totalSlides) % totalSlides;
  updateSlider();
}

// Make functions globally available for inline onclick handlers
window.next = next;
window.prev = prev;

// Catalog carousel variables and functions
let catalogIndex = 0;
let catalogCards;
let totalCatalogCards;
let visibleCards = 4; // Default for desktop

function getVisibleCards() {
  // Determine number of visible cards based on screen width
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
  visibleCards = getVisibleCards();
  const slidePercentage = 100 / visibleCards;

  // Add smooth animation with easing
  catalogCards.style.transform = `translateX(-${
    catalogIndex * slidePercentage
  }%)`;

  // Update active state for buttons
  document.getElementById("catalog-prev").disabled = catalogIndex === 0;
  document.getElementById("catalog-next").disabled =
    catalogIndex >= totalCatalogCards - visibleCards;

  // Add visual feedback
  document.getElementById("catalog-prev").style.opacity =
    catalogIndex === 0 ? "0.5" : "1";
  document.getElementById("catalog-next").style.opacity =
    catalogIndex >= totalCatalogCards - visibleCards ? "0.5" : "1";
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

// Handle window resize
window.addEventListener("resize", updateCatalog);

// Sticky nav on scroll
const nav = document.querySelector(".nav");
const navHeight = nav.offsetHeight;

window.addEventListener("scroll", () => {
  if (window.scrollY > navHeight) {
    nav.classList.add("sticky");
  } else {
    nav.classList.remove("sticky");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Initialize hero slider
  slides = document.querySelector(".slides");
  totalSlides = document.querySelectorAll(".slide").length;
  updateSlider();

  // Initialize catalog carousel
  catalogCards = document.querySelector("#catalog .cards");
  totalCatalogCards = document.querySelectorAll("#catalog .card").length;
  visibleCards = getVisibleCards();
  updateCatalog(); // Initialize button states

  // Add event listeners for catalog navigation
  const prevButton = document.getElementById("catalog-prev");
  const nextButton = document.getElementById("catalog-next");

  if (prevButton) {
    prevButton.addEventListener("click", prevCatalog);
  }

  if (nextButton) {
    nextButton.addEventListener("click", nextCatalog);
  }

  // Initialize auth UI and load cart
  updateAuthUI();
  loadCart();
  attachFormListeners();
});

// clicking cart and adding to cart
cardCart.forEach((item) => {
  item.addEventListener("click", (e) => {
    const selectedItem = e.target.closest(".card");
    const itemName = selectedItem.querySelector("h3")?.textContent || "";
    const itemPrice =
      selectedItem.querySelector(".card-price")?.textContent || "";
    const itemImage = selectedItem.querySelector(".card-img img")?.src || "";

    const cartItem = {
      name: itemName,
      price: itemPrice,
      image: itemImage,
      quantity: 1,
    };

    // Check if item already exists in cart
    const existingItem = cartItems.find((item) => item.name === itemName);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cartItems.push(cartItem);
    }

    updateCart();
    saveCart();
  });
});

// Update cart UI
function updateCart() {
  const cartItemsContainer = document.querySelector(".cart-items");
  const emptyCartMessage = cartItemsContainer.querySelector(
    ".empty-cart-message"
  );
  const totalAmountElement = document.querySelector(".total-amount");
  const cartLabel = document.querySelector(".cart-label");

  // Clear current items (except empty message)
  cartItemsContainer.innerHTML = "";

  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="empty-cart-message">Your cart is empty</p>';
    totalAmountElement.textContent = "$0.00";
    cartLabel.textContent = "Empty";
    return;
  }

  // Add items to cart
  let total = 0;
  cartItems.forEach((item, index) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.className = "cart-item";

    // Extract numeric price
    const priceMatch = item.price.match(/\d+/);
    const itemPrice = priceMatch ? parseInt(priceMatch[0]) : 0;
    const itemTotal = itemPrice * item.quantity;
    total += itemTotal;

    cartItemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
      <div style="flex: 1; margin-left: 8px;">
        <h4 style="margin: 0; font-size: 13px;">${item.name}</h4>
        <p style="margin: 2px 0; font-size: 11px; color: #666;">${item.price}</p>
      </div>
      <div class="cart-item-controls" style="display: flex; align-items: center; gap: 5px;">
        <button class="decrease-qty" data-index="${index}" style="padding: 2px 6px; cursor: pointer; border: 1px solid #ddd; background: white;">-</button>
        <span style="font-size: 13px;">${item.quantity}</span>
        <button class="increase-qty" data-index="${index}" style="padding: 2px 6px; cursor: pointer; border: 1px solid #ddd; background: white;">+</button>
        <button class="remove-item" data-index="${index}" style="padding: 2px 6px; cursor: pointer; color: red; border: 1px solid #ddd; background: white;">×</button>
      </div>
    `;

    cartItemElement.style.cssText =
      "display: flex; align-items: center; padding: 8px; border-bottom: 1px solid #eee;";

    cartItemsContainer.appendChild(cartItemElement);
  });

  // Update total and label
  totalAmountElement.textContent = `₽${total}`;
  cartLabel.textContent = `${cartItems.length} item${
    cartItems.length > 1 ? "s" : ""
  }`;

  // Update checkout button
  const checkoutBtn = document.querySelector(".checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.onclick = handleCheckout;
  }
}

// Handle checkout
function handleCheckout() {
  if (!isLoggedIn()) {
    alert("Please login to proceed with checkout");
    // Open login form
    const loginContainer = document.getElementById("login-container");
    loginContainer.classList.remove("visually-hidden");
    return;
  }

  // Proceed with checkout
  const totalAmount = document.querySelector(".total-amount").textContent;
  alert(
    `Checkout for ${cartItems.length} items. Total: ${totalAmount}\n\nOrder placed successfully!`
  );

  // Clear cart after checkout
  cartItems = [];
  updateCart();
  saveCart();

  // Close cart dropdown
  const cartContainer = document.getElementById("cart-container");
  cartContainer.classList.add("visually-hidden");
}

// Handle cart item controls with event delegation
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("increase-qty")) {
    e.stopPropagation();
    const index = parseInt(e.target.dataset.index);
    cartItems[index].quantity++;
    updateCart();
    saveCart();
  } else if (e.target.classList.contains("decrease-qty")) {
    e.stopPropagation();
    const index = parseInt(e.target.dataset.index);
    if (cartItems[index].quantity > 1) {
      cartItems[index].quantity--;
    } else {
      cartItems.splice(index, 1);
    }
    updateCart();
    saveCart();
  } else if (e.target.classList.contains("remove-item")) {
    e.stopPropagation();
    const index = parseInt(e.target.dataset.index);
    cartItems.splice(index, 1);
    updateCart();
    saveCart();
  }
});
