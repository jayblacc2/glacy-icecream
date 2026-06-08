// Cart + User Dropdown Toggle Functionality with Authentication Support
import { debugError } from "../utils/debug.js";
import { escapeHtml } from "../utils/security.js";
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
  const navUserLink = document.getElementById("nav-user-link");
  const userDropdown = document.getElementById("user-dropdown");

  // Determine page paths based on current location
  function getLoginPath() {
    const path = window.location.pathname;
    if (path.includes("/pages/")) return "login.html";
    return "pages/login.html";
  }

  function getProfilePath(tab) {
    const path = window.location.pathname;
    const base = path.includes("/pages/") ? "profile.html" : "pages/profile.html";
    return tab ? `${base}?tab=${tab}` : base;
  }

  function getAdminPath() {
    return window.location.pathname.includes("/pages/") ? "admin.html" : "pages/admin.html";
  }

  function getCheckoutPath() {
    return window.location.pathname.includes("/pages/") ? "checkout.html" : "pages/checkout.html";
  }

  function getCatalogPath() {
    return window.location.pathname.includes("/pages/") ? "catalogs.html" : "pages/catalogs.html";
  }

  // ========================
  // USER DROPDOWN (logged in)
  // ========================

  function buildUserDropdown(user) {
    const displayName = (
      user.name?.split(" ")[0] || user.email.split("@")[0]
    ).toUpperCase();
    const fullName = user.name || user.email.split("@")[0];
    const initials = (user.name || user.email)
      .split(/\s+|@/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() || "")
      .join("");
    const isAdmin = user.role === "admin";

    const avatarHTML = user.avatar?.url
      ? `<img src="${escapeHtml(user.avatar.url)}" alt="${escapeHtml(fullName)}" />`
      : initials || `<i class="fa-solid fa-user"></i>`;

    const roleClass = isAdmin ? "is-admin" : "";
    const roleLabel = isAdmin ? "Admin" : "Member";

    const adminItem = isAdmin
      ? `<li class="user-dropdown-item"><a href="${getAdminPath()}"><i class="fa-solid fa-gauge-high"></i> Admin Panel</a></li>`
      : "";

    return `
      <div class="user-dropdown-header">
        <div class="user-dropdown-avatar">${avatarHTML}</div>
        <div class="user-dropdown-info">
          <div class="user-dropdown-name">${escapeHtml(fullName)}</div>
          <div class="user-dropdown-email">${escapeHtml(user.email)}</div>
          <span class="user-dropdown-role ${roleClass}">${roleLabel}</span>
        </div>
      </div>
      <ul class="user-dropdown-menu">
        <li class="user-dropdown-item"><a href="${getProfilePath("overview")}"><i class="fa-solid fa-chart-pie"></i> Overview</a></li>
        <li class="user-dropdown-item"><a href="${getProfilePath("profile")}"><i class="fa-solid fa-user-pen"></i> Edit Profile</a></li>
        <li class="user-dropdown-item"><a href="${getProfilePath("orders")}"><i class="fa-solid fa-bag-shopping"></i> My Orders</a></li>
        ${adminItem}
        <li class="user-dropdown-divider"></li>
        <li class="user-dropdown-item is-logout"><button type="button" id="nav-logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Logout</button></li>
      </ul>
    `;
  }

  function toggleUserDropdown(event) {
    if (event) event.preventDefault();
    if (event) event.stopPropagation();
    // Hide other dropdowns
    if (cartContainer) cartContainer.classList.add("visually-hidden");
    if (searchBox) searchBox.classList.add("visually-hidden");
    userDropdown.classList.toggle("visually-hidden");
  }

  function closeUserDropdown() {
    userDropdown.classList.add("visually-hidden");
  }

  // ========================
  // NAV AUTH STATE
  // ========================

  async function updateNavAuth() {
    try {
      await getAuthInitPromise();
    } catch (_) {}

    if (isLoggedIn()) {
      const user = getCurrentUser();
      const displayName = (
        user.name?.split(" ")[0] || user.email.split("@")[0]
      ).toUpperCase();

      // Update desktop nav link (logged-in mode: shows avatar + first name, opens dropdown)
      if (navUserLink) {
        navUserLink.classList.add("is-logged-in");
        navUserLink.querySelector("span").textContent = displayName;
        const iconEl = navUserLink.querySelector("i");
        if (user.avatar?.url) {
          if (iconEl) {
            const img = document.createElement("img");
            img.src = user.avatar.url;
            img.alt = fullName;
            img.className = "nav-user-avatar";
            iconEl.replaceWith(img);
          }
        } else {
          // Ensure icon exists (not replaced by img)
          if (!navUserLink.querySelector("i")) {
            const i = document.createElement("i");
            i.className = "fa-solid fa-user";
            navUserLink.insertBefore(i, navUserLink.querySelector("span"));
          }
        }
        // Replace the href-only link with a click handler that toggles dropdown
        navUserLink.removeAttribute("href");
      }

      // Build and inject dropdown content
      if (userDropdown) {
        userDropdown.innerHTML = buildUserDropdown(user);
        const logoutBtn = userDropdown.querySelector("#nav-logout-btn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await handleLogout();
          });
        }
      }

      // Update sidebar
      if (sidebarLogin) {
        sidebarLogin.href = getProfilePath();
        sidebarLogin.querySelector("span").textContent = "Profile";
      }

      // Update mobile user button
      if (mobileUser) {
        mobileUser.onclick = () => { window.location.href = getProfilePath(); };
      }
    } else {
      // Logged-out mode: link navigates to login page
      if (navUserLink) {
        navUserLink.classList.remove("is-logged-in");
        navUserLink.href = getLoginPath();
        navUserLink.querySelector("span").textContent = "Account";
        // Restore default user icon
        const existingImg = navUserLink.querySelector(".nav-user-avatar");
        if (existingImg) {
          const i = document.createElement("i");
          i.className = "fa-solid fa-user";
          existingImg.replaceWith(i);
        }
      }
      if (userDropdown) {
        userDropdown.innerHTML = "";
        userDropdown.classList.add("visually-hidden");
      }

      if (sidebarLogin) {
        sidebarLogin.href = getLoginPath();
        sidebarLogin.querySelector("span").textContent = "Login";
      }

      if (mobileUser) {
        mobileUser.onclick = () => { window.location.href = getLoginPath(); };
      }
    }
  }

  // ========================
  // CART + SEARCH TOGGLES
  // ========================

  function toggleCart(event) {
    event.stopPropagation();
    if (window.innerWidth <= 1024) {
      window.location.href = getCheckoutPath();
      return;
    }
    if (searchBox) searchBox.classList.add("visually-hidden");
    if (userDropdown) userDropdown.classList.add("visually-hidden");
    cartContainer.classList.toggle("visually-hidden");
  }

  function toggleSearch(event) {
    event.stopPropagation();
    if (window.innerWidth <= 1024) {
      window.location.href = getCatalogPath();
      return;
    }
    if (cartContainer) cartContainer.classList.add("visually-hidden");
    if (userDropdown) userDropdown.classList.add("visually-hidden");
    searchBox.classList.toggle("visually-hidden");
  }

  function toggleUserDropdown(event) {
    if (window.innerWidth <= 1024) {
      if (isLoggedIn()) {
        window.location.href = getProfilePath();
      } else {
        window.location.href = getLoginPath();
      }
      return;
    }
    if (event) event.preventDefault();
    if (event) event.stopPropagation();
    if (cartContainer) cartContainer.classList.add("visually-hidden");
    if (searchBox) searchBox.classList.add("visually-hidden");
    userDropdown.classList.toggle("visually-hidden");
  }

  function closeUserDropdown() {
    userDropdown.classList.add("visually-hidden");
  }

  // Close all dropdowns when clicking outside (desktop only)
  function closeAllDropdowns(event) {
    if (window.innerWidth <= 1024) return;
    if (
      !event.target.closest(".form-cart") &&
      !event.target.closest("#cart-container") &&
      !event.target.closest(".form-user") &&
      !event.target.closest("#user-dropdown") &&
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
      if (userDropdown) userDropdown.classList.add("visually-hidden");
    }
  }

  // ========================
  // LOGOUT
  // ========================

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

  // ========================
  // EVENT WIRING
  // ========================

  if (cartIcon) cartIcon.addEventListener("click", toggleCart);
  if (cartLabel) cartLabel.addEventListener("click", toggleCart);
  if (searchIcon) searchIcon.addEventListener("click", toggleSearch);
  if (searchToggle) searchToggle.addEventListener("click", toggleSearch);

  // User link: when logged in it opens the dropdown; when logged out, the href navigates
  if (navUserLink) {
    navUserLink.addEventListener("click", (e) => {
      if (navUserLink.classList.contains("is-logged-in")) {
        toggleUserDropdown(e);
      }
      // else: let the <a href="login.html"> navigate normally
    });
  }
  if (userDropdown) {
    userDropdown.addEventListener("click", (e) => e.stopPropagation());
  }

  if (searchBox) {
    searchBox.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  }
  document.addEventListener("click", closeAllDropdowns);

  // Escape closes user dropdown
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && userDropdown && !userDropdown.classList.contains("visually-hidden")) {
      userDropdown.classList.add("visually-hidden");
    }
  });

  // ========================
  // EXPORTS + INIT
  // ========================

  window.handleNavLogout = handleLogout;
  window.updateNavAuth = updateNavAuth;

  await updateNavAuth();
});
