// Authentication Manager for Glacy Ice Cream Store
class AuthManager {
  constructor() {
    this.currentUser = this.loadUser();
    this.users = this.loadUsers();
  }

  // Load users from localStorage
  loadUsers() {
    const users = localStorage.getItem('glacy-users');
    return users ? JSON.parse(users) : [];
  }

  // Save users to localStorage
  saveUsers() {
    localStorage.setItem('glacy-users', JSON.stringify(this.users));
  }

  // Load current user session
  loadUser() {
    const user = localStorage.getItem('glacy-current-user');
    return user ? JSON.parse(user) : null;
  }

  // Save current user session
  saveUser(user) {
    localStorage.setItem('glacy-current-user', JSON.stringify(user));
    this.currentUser = user;
  }

  // Register new user
  register(username, password, confirmPassword) {
    // Validation
    if (!username || !password || !confirmPassword) {
      return { success: false, message: 'All fields are required' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match' };
    }

    // Check if user already exists
    const existingUser = this.users.find(u => u.username === username);
    if (existingUser) {
      return { success: false, message: 'Username already exists' };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username: username,
      password: password, // In production, hash this!
      createdAt: new Date().toISOString(),
      cart: []
    };

    this.users.push(newUser);
    this.saveUsers();

    return { success: true, message: 'Account created successfully', user: newUser };
  }

  // Login user
  login(username, password) {
    if (!username || !password) {
      return { success: false, message: 'Username and password are required' };
    }

    const user = this.users.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      return { success: false, message: 'Invalid username or password' };
    }

    // Create session
    this.saveUser({
      id: user.id,
      username: user.username
    });

    return { success: true, message: 'Login successful', user: user };
  }

  // Logout user
  logout() {
    localStorage.removeItem('glacy-current-user');
    this.currentUser = null;
    return { success: true, message: 'Logged out successfully' };
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Update user cart
  updateUserCart(cartItems) {
    if (!this.isLoggedIn()) return;

    const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
    if (userIndex !== -1) {
      this.users[userIndex].cart = cartItems;
      this.saveUsers();
    }
  }

  // Get user cart
  getUserCart() {
    if (!this.isLoggedIn()) return [];

    const user = this.users.find(u => u.id === this.currentUser.id);
    return user ? user.cart : [];
  }
}

// Export singleton instance
const authManager = new AuthManager();
export default authManager;