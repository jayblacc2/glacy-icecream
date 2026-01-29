export function createHeader() {
  return `
    <header id="header" class="container-center">
      <nav class="nav">
        <div class="nav-item">
          <div id="logo">
            <a href="${getBasePath()}index.html">
              <img src="${getBasePath()}images/icons/logo.svg" alt="site logo" />
            </a>
          </div>
          <ul class="nav-list">
            <li><a href="${getBasePath()}pages/catalogs.html" class="nav-link">Catalog</a></li>
            <li><a href="${getBasePath()}index.html#contact" class="nav-link">Delivery & Payment</a></li>
            <li><a href="${getBasePath()}index.html#about" class="nav-link">About us</a></li>
            <li><a href="${getBasePath()}pages/blog.html" class="nav-link">Blog</a></li>
          </ul>
        </div>

        <div class="nav-info">
          <div class="nav-form">
            <p>+1 317 234-67-33</p>
            <div class="form-group search" id="search-toggle">
              <img src="${getBasePath()}images/icons/search.svg" alt="search" />
              <div class="search-box visually-hidden" id="search-box">
                <form class="search-form">
                  <input type="search" id="search" name="q" placeholder="Search products" aria-label="Search" required />
                  <button type="submit" class="btn-search">
                    <span class="search-text visually-hidden">Search</span>
                    <i class="fa-solid fa-magnifying-glass"></i>
                  </button>
                </form>
              </div>
            </div>
            <div class="form-group form-login">
              <img src="${getBasePath()}images/icons/logout.svg" alt="signup-img" class="login-icon" />
              <label for="login" class="login-label">login</label>
              <div class="login-container visually-hidden" id="login-container"></div>
            </div>
            <div class="form-group form-cart">
              <i class="fa-solid fa-cart-shopping cart-icon"></i>
              <label for="cart" class="cart-label">Empty</label>
              <div class="cart-container visually-hidden" id="cart-container">
                <h3>Your Cart</h3>
                <div class="cart-items">
                  <p class="empty-cart-message">Your cart is empty</p>
                </div>
                <div class="cart-total">
                  <p>Total: <span class="total-amount">$0.00</span></p>
                  <button class="checkout-btn">Checkout</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button class="burger-menu" id="burger-menu" aria-label="Toggle menu">
          <span class="burger-line"></span>
          <span class="burger-line"></span>
          <span class="burger-line"></span>
        </button>
      </nav>

      <div class="mobile-sidebar" id="mobile-sidebar">
        <div class="sidebar-content">
          <button class="sidebar-close" id="sidebar-close" aria-label="Close menu">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <ul class="sidebar-nav">
            <li><a href="${getBasePath()}pages/catalogs.html" class="sidebar-link">Catalog</a></li>
            <li><a href="${getBasePath()}index.html#contact" class="sidebar-link">Delivery & Payment</a></li>
            <li><a href="${getBasePath()}index.html#about" class="sidebar-link">About us</a></li>
            <li><a href="${getBasePath()}pages/blog.html" class="sidebar-link">Blog</a></li>
          </ul>
          <div class="sidebar-actions">
            <div class="sidebar-phone">
              <i class="fa-solid fa-phone"></i>
              <p>+1 317 234-67-33</p>
            </div>
            <button class="sidebar-btn" id="sidebar-search">
              <i class="fa-solid fa-magnifying-glass"></i>
              <span>Search</span>
            </button>
            <button class="sidebar-btn" id="sidebar-login">
              <i class="fa-solid fa-user"></i>
              <span>User</span>
            </button>
            <button class="sidebar-btn" id="sidebar-cart">
              <i class="fa-solid fa-cart-shopping"></i>
              <span>Cart</span>
            </button>
          </div>
        </div>
      </div>
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
    </header>
  `;
}

function getBasePath() {
  return window.location.pathname.includes("/pages/") ? "../" : "./";
}

export function initializeHeader() {
  const header = document.getElementById("header-placeholder");
  if (header) {
    header.innerHTML = createHeader();
  }
}
