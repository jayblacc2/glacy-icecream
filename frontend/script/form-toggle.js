// Form and Cart Toggle Functionality with Authentication Support
import { escapeHtml } from "../utils/security.js";
import { debugError } from "../utils/debug.js";
import {
  getAuthInitPromise,
  getCurrentUser,
  isLoggedIn,
  logout,
} from "./auth.js";
import { createAuthForms } from "../utils/auth-form.js";

document.addEventListener("DOMContentLoaded", async function () {
  // Elements
  const loginIcon = document.querySelector(".login-icon");
  const loginLabel = document.querySelector(".login-label");
  const loginContainer = document.getElementById("login-container");
  const cartIcon = document.querySelector(".cart-icon");
  const cartLabel = document.querySelector(".cart-label");
  const cartContainer = document.getElementById("cart-container");
  const searchIcon = document.querySelector(".search img");
  const searchToggle = document.getElementById("search-toggle");
  const searchBox = document.querySelector(".search-box");
  const searchForm = document.querySelector(".search-form");

  // Cached form references - avoid duplicate queries
  let loginForm = null;
  let signupForm = null;


  function getForms() {
    if (!loginForm) {
      loginForm = loginContainer?.querySelector(".login-form");
    }
    if (!signupForm) {
      signupForm = loginContainer?.querySelector(".signup-form");
    }
  }

  window.resetFormCache = function () {
    loginForm = null;
    signupForm = null;
  };

  // Toggle login form
  function toggleLogin(event) {
    event.stopPropagation();


    cartContainer.classList.add("visually-hidden");
    searchBox.classList.add("visually-hidden");


    loginContainer.classList.toggle("visually-hidden");

    getForms();
    if (loginForm && signupForm) {
      loginForm.classList.remove("visually-hidden");
      signupForm.classList.add("visually-hidden");
    }
  }

  // Toggle cart
  function toggleCart(event) {
    event.stopPropagation();

    // Hide other containers
    if (loginContainer) {
      loginContainer.classList.add("visually-hidden");
    }
    getForms();
    if (signupForm) signupForm.classList.add("visually-hidden");
    if (loginForm) loginForm.classList.add("visually-hidden");
    searchBox.classList.add("visually-hidden");

    // Toggle cart container
    cartContainer.classList.toggle("visually-hidden");
  }

  // Toggle search
  function toggleSearch(event) {
    event.stopPropagation();

    // Hide other containers
    loginContainer.classList.add("visually-hidden");
    cartContainer.classList.add("visually-hidden");

    // Toggle search box
    searchBox.classList.toggle("visually-hidden");
  }

  // Close all dropdowns when clicking outside
  function closeAllDropdowns(event) {
    if (
      !event.target.closest(".form-login") &&
      !event.target.closest(".form-signup") &&
      !event.target.closest(".form-cart") &&
      !event.target.closest("#cart-container") &&
      !event.target.classList.contains("increase-qty") &&
      !event.target.classList.contains("decrease-qty") &&
      !event.target.classList.contains("remove-item") &&
      !event.target.closest(".search") &&
      !event.target.closest(".search-box") &&
      !event.target.closest(".search-form") &&
      !event.target.closest("#search")
    ) {
      loginContainer.classList.add("visually-hidden");
      getForms();
      if (signupForm) signupForm.classList.add("visually-hidden");
      cartContainer.classList.add("visually-hidden");
      searchBox.classList.add("visually-hidden");
    }
  }

  // Event listeners
  loginIcon.addEventListener("click", toggleLogin);
  loginLabel.addEventListener("click", toggleLogin);
  cartIcon.addEventListener("click", toggleCart);
  cartLabel.addEventListener("click", toggleCart);

  searchIcon.addEventListener("click", toggleSearch);

  if (searchToggle) {
    searchToggle.addEventListener("click", toggleSearch);
  }

  if (searchBox) {
    searchBox.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  }

  document.addEventListener("click", closeAllDropdowns);

  // ========================
  // AUTH UI FUNCTIONS
  // ========================

  // Update authentication UI based on login state
  async function updateAuthUI() {
    if (!loginLabel || !loginContainer) return;

    if (isLoggedIn()) {
      const user = getCurrentUser();
      // Display first name in uppercase
      const displayName = (
        user.name?.split(" ")[0] || user.email.split("@")[0]
      ).toUpperCase();
      loginLabel.textContent = displayName;

      loginContainer.innerHTML = `
        <div class="user-profile">
          <h3>Welcome, ${escapeHtml(displayName)}!</h3>
          <p style="">You are logged in</p>
          <button class="logout-btn">Logout</button>
        </div>
      `;

      const logoutBtn = loginContainer.querySelector(".logout-btn");
      logoutBtn.addEventListener("click", handleLogout);
    } else {
      loginLabel.textContent = "User";
      restoreLoginForms();
    }
  }

  // Handle user logout
  async function handleLogout() {
    try {
      await logout();

      // Clear cart if updateCart function exists (from script.js)
      if (typeof window.updateCart === "function") {
        if (typeof window.cartItems !== "undefined") {
          window.cartItems = [];
        }
        window.updateCart();
      }

      // Update UI
      updateAuthUI();

      // Hide login container
      loginContainer.classList.add("visually-hidden");

      // Show toast if available
      if (typeof window.showToast === "function") {
        window.showToast("Logged out successfully");
      }
    } catch (error) {
      debugError("Logout error:", error);
    }
  }

  // Restore login forms when user is not logged in
  function restoreLoginForms() {
    if (!loginContainer) return;

    loginContainer.innerHTML = "";
    loginContainer.appendChild(createAuthForms());

    // Reset form cache
    window.resetFormCache();

    // Attach form listeners if script.js has the function
    requestAnimationFrame(() => {
      if (typeof window.attachFormListeners === "function") {
        window.attachFormListeners();
      }
    });
  }

  // Export updateAuthUI for use by script.js
  window.updateAuthUI = updateAuthUI;

  // ========================
  // INITIALIZE AUTH UI
  // ========================
  try {
    await getAuthInitPromise();
    await updateAuthUI();
  } catch (error) {
    debugError("Auth UI init error:", error);
  }
});

