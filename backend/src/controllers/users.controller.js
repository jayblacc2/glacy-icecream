import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const saltRound = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRound);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isLoggedIn: true,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isLoggedIn: user.isLoggedIn,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Set user as logged in
    user.isLoggedIn = true;
    await user.save();

    // Generate tokens
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookies
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isLoggedIn: user.isLoggedIn,
        role: user.role,
        cart: user.cart,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if user exists first
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete the user
    await User.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const userLogout = async (req, res) => {
  try {
    // Get user ID from token if available
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          // Set user as logged out
          user.isLoggedIn = false;
          await user.save();
        }
      } catch (error) {
        console.error("Error verifying token during logout:", error);
      }
    }

    // Clear token cookie with same options as set
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    // Clear refreshToken cookie with same options as set
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    res.status(200).json({
      success: true,
      message: "Logout successful",
      isLoggedIn: false,
    });
  } catch (error) {
    console.error("Error logging out:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const checkAuthStatus = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(200).json({
        success: true,
        isLoggedIn: false,
        user: null,
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(200).json({
          success: true,
          isLoggedIn: false,
          user: null,
        });
      }

      res.status(200).json({
        success: true,
        isLoggedIn: user.isLoggedIn,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          cart: user.cart,
        },
      });
    } catch (error) {
      // Token is invalid or expired
      return res.status(200).json({
        success: true,
        isLoggedIn: false,
        user: null,
      });
    }
  } catch (error) {
    console.error("Error checking auth status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { registerUser, userLogin, deleteUser, userLogout, checkAuthStatus };
