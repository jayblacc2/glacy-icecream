// Form and Cart Toggle Functionality

document.addEventListener("DOMContentLoaded", function () {
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

  // Toggle login form
  function toggleLogin(event) {
    event.stopPropagation();

    // Hide other containers
    cartContainer.classList.add("visually-hidden");
    searchBox.classList.add("visually-hidden");

    // Toggle login container
    loginContainer.classList.toggle("visually-hidden");
    // Ensure sign-in form shows by default
    const loginForm = loginContainer?.querySelector(".login-form");
    const signupForm = loginContainer?.querySelector(".signup-form");
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
    const signupForm = loginContainer?.querySelector(".signup-form");
    const loginForm = loginContainer?.querySelector(".login-form");
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
      const signupForm = loginContainer?.querySelector(".signup-form");
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
  // Note: Form switching buttons (show-signup, show-login) are handled by script.js
  searchIcon.addEventListener("click", toggleSearch);
  // Allow clicking the whole search pill
  if (searchToggle) {
    searchToggle.addEventListener("click", toggleSearch);
  }

  // Prevent search box from closing when clicking inside it
  if (searchBox) {
    searchBox.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  }

  document.addEventListener("click", closeAllDropdowns);
});
