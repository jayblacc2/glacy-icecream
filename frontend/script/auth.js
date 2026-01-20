// Authentication functions for Glacy Ice Cream Store

// Internal state
let currentUser = null;
let users = [];

// Initialize auth state
async function initializeAuth() {
  currentUser = loadUser();
  users = await loadUsers();
}

// Load users from combined JSON file
async function loadUsers() {
  try {
    const response = await fetch("data/userdb.json");
    const data = await response.json();
    const storedUsers = localStorage.getItem("glacy-users");
    return storedUsers ? JSON.parse(storedUsers) : data.users || [];
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}

// Save users to localStorage and simulate file persistence
function saveUsers() {
  localStorage.setItem("glacy-users", JSON.stringify(users));
  // In a real application, this would make an API call to update the JSON file on the server
  console.log("Users saved. In production, this would persist to the server.");
}

// Load current user session
function  loadUser() {
  const user = localStorage.getItem("glacy-current-user");
  return user ? JSON.parse(user) : null;
}

// Save current user session
function saveUser(user) {
  localStorage.setItem("glacy-current-user", JSON.stringify(user));
  currentUser = user;
}

// Register new user
function register(username, password, confirmPassword) {
  // Validation
  if (!username || !password || !confirmPassword) {
    return { success: false, message: "All fields are required" };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters",
    };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Passwords do not match" };
  }

  // Check if user already exists
  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    return { success: false, message: "Username already exists" };
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    username: username,
    password: password, // In production, hash this!
    createdAt: new Date().toISOString(),
    cart: [],
  };

  users.push(newUser);
  saveUsers();

  // Simulate saving to JSON file (in production this would be server-side)
  console.log('New user registered and saved to localStorage. In production, this would update the JSON file.');

  return {
    success: true,
    message: "Account created successfully",
    user: newUser,
  };
}

// Login user
function login(username, password) {
  if (!username || !password) {
    return { success: false, message: "Username and password are required" };
  }

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return { success: false, message: "Invalid username or password" };
  }

  // Create session
  saveUser({
    id: user.id,
    username: user.username,
  });

  // Simulate authentication from JSON file
  console.log('User authenticated successfully from stored user data.');

  return { success: true, message: "Login successful", user: user };
}

// Logout user
function logout() {
  localStorage.removeItem("glacy-current-user");
  currentUser = null;
  return { success: true, message: "Logged out successfully" };
}

// Check if user is logged in
function isLoggedIn() {
  return currentUser !== null;
}

// Get current user
function getCurrentUser() {
  return currentUser;
}

// Update user cart
function updateUserCart(cartItems) {
  if (!isLoggedIn()) return;

  const userIndex = users.findIndex((u) => u.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex].cart = cartItems;
    saveUsers();
  }
}

// Get user cart
function getUserCart() {
  if (!isLoggedIn()) return [];

  const user = users.find((u) => u.id === currentUser.id);
  return user ? user.cart : [];
}

// Initialize on module load
(async () => {
  await initializeAuth();
})();

// Export functions
export {
  register,
  login,
  logout,
  isLoggedIn,
  getCurrentUser,
  updateUserCart,
  getUserCart,
};
