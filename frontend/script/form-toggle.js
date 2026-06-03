// Cart Toggle Functionality with Authentication Support
import { debugError } from "../utils/debug.js";
import {
  getAuthInitPromise,
  getCurrentUser,
  isLoggedIn,
  logout,
} from "./auth.js";

document.addEventListener("DOMContentLoaded", async function () {
  // Elements
  const cartIcon = document.querySelector(".cart-icon");
  const cartLabel = document.querySelector(".cart-label");
  const cartContainer = document.getElementById("cart-container");
  const searchIcon = document.querySelector(".search img");
  const searchToggle = document.getElementById("search-toggle");
  const searchBox = document.querySelector(".search-box");
  const sidebarLogin = document.getElementById("sidebar-login");
  const mobileUser = document.getElementById("mobile-user");
  const navUserLink = document.querySelector(".nav-user-link");

  // Determine login page path based on current page
  function getLoginPath() {
    const path = window.location.pathname;
    if (path.includes("/pages/")) return "login.html";
    return "pages/login.html";
  }

  function getProfilePath() {
    const path = window.location.pathname;
    if (path.includes("/pages/")) return "profile.html";
    return "pages/profile.html";
  }

  // Update nav user link based on auth state
  async function updateNavAuth() {
    try {
      await getAuthInitPromise();
    } catch (_) {}

    if (isLoggedIn()) {
      const user = getCurrentUser();
      const displayName = (
        user.name?.split(" ")[0] || user.email.split("@")[0]
      ).toUpperCase();

      // Update desktop nav link
      if (navUserLink) {
        navUserLink.href = getProfilePath();
        navUserLink.querySelector("span").textContent = displayName;
      }

      // Update sidebar login button
      if (sidebarLogin) {
        sidebarLogin.href = getProfilePath();
        sidebarLogin.querySelector("span").textContent = "Profile";
      }

      // Update mobile user button
      if (mobileUser) {
        mobileUser.onclick = () => { window.location.href = getProfilePath(); };
      }
    } else {
      // Update sidebar login button
      if (sidebarLogin) {
        sidebarLogin.href = getLoginPath();
        sidebarLogin.querySelector("span").textContent = "Login";
      }

      // Update mobile user button
      if (mobileUser) {
        mobileUser.onclick = () => { window.location.href = getLoginPath(); };
      }
    }
  }

  // Toggle cart
  function toggleCart(event) {
    event.stopPropagation();
    if (searchBox) searchBox.classList.add("visually-hidden");
    cartContainer.classList.toggle("visually-hidden");
  }

  // Toggle search
  function toggleSearch(event) {
    event.stopPropagation();
    if (cartContainer) cartContainer.classList.add("visually-hidden");
    searchBox.classList.toggle("visually-hidden");
  }

  // Close all dropdowns when clicking outside
  function closeAllDropdowns(event) {
    if (
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
      if (cartContainer) cartContainer.classList.add("visually-hidden");
      if (searchBox) searchBox.classList.add("visually-hidden");
    }
  }

  // Event listeners
  if (cartIcon) cartIcon.addEventListener("click", toggleCart);
  if (cartLabel) cartLabel.addEventListener("click", toggleCart);
  if (searchIcon) searchIcon.addEventListener("click", toggleSearch);
  if (searchToggle) searchToggle.addEventListener("click", toggleSearch);
  if (searchBox) {
    searchBox.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  }
  document.addEventListener("click", closeAllDropdowns);

  // Handle logout from nav (when logged in, clicking nav link shows logout option)
  async function handleLogout() {
    try {
      await logout();
      if (typeof window.cartItems !== "undefined" && window.cartItems.length > 0) {
        try {
          localStorage.setItem("glacy-guest-cart", JSON.stringify(window.cartItems));
        } catch (_) {}
      }
      if (typeof window.updateCart === "function") {
        if (typeof window.cartItems !== "undefined") window.cartItems = [];
        window.updateCart();
      }
      if (typeof window.showToast === "function") {
        window.showToast("Logged out successfully");
      }
      window.location.reload();
    } catch (error) {
      debugError("Logout error:", error);
    }
  }

  // Export for use by other modules
  window.handleNavLogout = handleLogout;
  window.updateNavAuth = updateNavAuth;

  // Initialize
  await updateNavAuth();
});
