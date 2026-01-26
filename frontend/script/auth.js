let currentUser = null;
let authChecked = false;

// API Base URL - Adjust this based on your Vite proxy configuration
const API_BASE_URL = "/api/v1/users";

// Initialization promise - allows other modules to wait for auth to be ready
let authInitPromise = null;
let authInitResolve = null;

// Initialize auth state by checking authentication status
async function initializeAuth() {
  try {
    const response = await fetch(`${API_BASE_URL}/check-auth`, {
      method: "GET",
      credentials: "include", // Include cookies in request
    });

    const data = await response.json();

    if (data.success && data.isLoggedIn) {
      currentUser = data.user;
    } else {
      currentUser = null;
      // Clear any stale local storage data
      localStorage.removeItem("glacy-current-user");
    }

    authChecked = true;
    if (authInitResolve) {
      authInitResolve(data);
    }
    return data;
  } catch (error) {
    console.error("Error initializing auth:", error);
    currentUser = null;
    authChecked = true;
    if (authInitResolve) {
      authInitResolve({ success: false, isLoggedIn: false, user: null });
    }
    return { success: false, isLoggedIn: false, user: null };
  }
}

// Get or create the initialization promise
function getAuthInitPromise() {
  if (!authInitPromise) {
    authInitPromise = new Promise((resolve) => {
      authInitResolve = resolve;
    });
  }
  return authInitPromise;
}

// Register new user via backend API
async function registerUser(name, email, password, confirmPassword) {
  try {
    if (!name || !email || !password || !confirmPassword) {
      return { success: false, message: "All fields are required" };
    }

    if (name.length < 3) {
      return {
        success: false,
        message: "Name must be at least 3 characters",
      };
    }

    if (password.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters",
      };
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Passwords do not match" };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: "Please enter a valid email address" };
    }

    // Make API call to register user
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in response
      body: JSON.stringify({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user;
      // Save user info to localStorage for client-side access
      localStorage.setItem("glacy-current-user", JSON.stringify(data.user));
      return {
        success: true,
        message: data.message,
        user: data.user,
      };
    } else {
      return {
        success: false,
        message: data.message || "Registration failed",
      };
    }
  } catch (error) {
    console.error("Error registering user:", error);
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
}

// Login user via backend API
async function login(email, password) {
  try {
    if (!email || !password) {
      return { success: false, message: "Email and password are required" };
    }

    // Make API call to login user
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in response
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password: password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user;
      // Save user info to localStorage for client-side access
      localStorage.setItem("glacy-current-user", JSON.stringify(data.user));
      return {
        success: true,
        message: data.message,
        user: data.user,
      };
    } else {
      return {
        success: false,
        message: data.message || "Login failed",
      };
    }
  } catch (error) {
    console.error("Error logging in:", error);
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
}

// Logout user via backend API
async function logout() {
  try {
    // Make API call to logout user
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include", // Include cookies in request
    });

    const data = await response.json();

    // Clear local state regardless of API response
    currentUser = null;
    localStorage.removeItem("glacy-current-user");

    if (data.success) {
      return {
        success: true,
        message: data.message || "Logged out successfully",
      };
    } else {
      // Even if API fails, we've cleared local state
      return {
        success: true,
        message: "Logged out successfully",
      };
    }
  } catch (error) {
    console.error("Error logging out:", error);
    // Still clear local state on error
    currentUser = null;
    localStorage.removeItem("glacy-current-user");
    return {
      success: true,
      message: "Logged out successfully",
    };
  }
}

// Check if user is logged in
function isLoggedIn() {
  // First check if we've initialized auth
  if (!authChecked) {
    console.warn("Auth not initialized. Call initializeAuth() first.");
    return false;
  }

  return currentUser !== null;
}

// Get current user
function getCurrentUser() {
  return currentUser;
}

// Update user cart - now handled by backend
async function updateUserCart(cartItems) {
  console.warn("updateUserCart is deprecated. Use backend cart API directly.");

  if (!isLoggedIn()) {
    return { success: false, message: "User not logged in" };
  }
  const userData = JSON.parse(
    localStorage.getItem("glacy-current-user") || "{}"
  );
  userData.cart = cartItems;
  localStorage.setItem("glacy-current-user", JSON.stringify(userData));

  return { success: true, message: "Cart updated locally" };
}

function getUserCart() {
  if (!isLoggedIn()) return [];

  const userData = JSON.parse(
    localStorage.getItem("glacy-current-user") || "{}"
  );
  return userData.cart || [];
}

// Re-check authentication status
async function checkAuthStatus() {
  return await initializeAuth();
}

// Initialize on module load
(async () => {
  await initializeAuth();
})();

// Export functions
export {
  checkAuthStatus,
  getCurrentUser,
  getUserCart,
  initializeAuth,
  isLoggedIn,
  login,
  logout,
  registerUser,
  updateUserCart,
  getAuthInitPromise,
};
