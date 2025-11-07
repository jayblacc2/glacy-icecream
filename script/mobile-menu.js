// Mobile Burger Menu Functionality
document.addEventListener("DOMContentLoaded", function () {
  const burgerMenu = document.getElementById("burger-menu");
  const mobileSidebar = document.getElementById("mobile-sidebar");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  const sidebarClose = document.getElementById("sidebar-close");
  const sidebarLinks = document.querySelectorAll(".sidebar-link");

  // Sidebar action buttons
  const sidebarSearch = document.getElementById("sidebar-search");
  const sidebarLogin = document.getElementById("sidebar-login");
  const sidebarCart = document.getElementById("sidebar-cart");

  // Desktop elements
  const searchToggle = document.getElementById("search-toggle");
  const loginContainer = document.getElementById("login-container");
  const cartContainer = document.getElementById("cart-container");

  // Function to open sidebar
  function openSidebar() {
    mobileSidebar.classList.add("active");
    sidebarOverlay.classList.add("active");
    burgerMenu.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent scrolling when sidebar is open
  }

  // Function to close sidebar
  function closeSidebar() {
    mobileSidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    burgerMenu.classList.remove("active");
    document.body.style.overflow = ""; // Restore scrolling
  }

  // Toggle sidebar when burger menu is clicked
  burgerMenu.addEventListener("click", function () {
    if (mobileSidebar.classList.contains("active")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  // Close sidebar when close button is clicked
  sidebarClose.addEventListener("click", closeSidebar);

  // Close sidebar when overlay is clicked
  sidebarOverlay.addEventListener("click", closeSidebar);

  // Close sidebar when a navigation link is clicked
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function () {
      closeSidebar();
    });
  });

  // Handle sidebar search button
  sidebarSearch.addEventListener("click", function () {
    closeSidebar();
    // Trigger desktop search functionality
    if (searchToggle) {
      const searchBox = document.getElementById("search-box");
      if (searchBox) {
        searchBox.classList.remove("visually-hidden");
        // Focus on search input
        const searchInput = searchBox.querySelector('input[type="search"]');
        if (searchInput) {
          setTimeout(() => searchInput.focus(), 300);
        }
      }
    }
  });

  // Handle sidebar login button
  sidebarLogin.addEventListener("click", function () {
    closeSidebar();
    // Trigger desktop login functionality
    if (loginContainer) {
      loginContainer.classList.remove("visually-hidden");
    }
  });

  // Handle sidebar cart button
  sidebarCart.addEventListener("click", function () {
    closeSidebar();
    // Trigger desktop cart functionality
    if (cartContainer) {
      cartContainer.classList.remove("visually-hidden");
    }
  });

  // Close sidebar on window resize if screen becomes larger
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768 && mobileSidebar.classList.contains("active")) {
      closeSidebar();
    }
  });

  // Prevent body scroll when sidebar is open
  mobileSidebar.addEventListener(
    "touchmove",
    function (e) {
      e.stopPropagation();
    },
    { passive: false }
  );
});
