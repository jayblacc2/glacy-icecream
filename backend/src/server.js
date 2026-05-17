import "./config/env.config.js";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { csrfProtection, getCsrfToken } from "./middleware/csrf.middleware.js";
import cartRoutes from "./routes/cart.route.js";
import newsletterRoutes from "./routes/newsletter.route.js";
import orderRoutes from "./routes/order.route.js";
import postsRoutes from "./routes/posts.route.js";
import productsRoutes from "./routes/products.route.js";
import usersRoutes from "./routes/users.route.js";

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// HTTP request logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/v1/users/login", authLimiter);
app.use("/api/v1/users/register", authLimiter);
app.use("/api/v1/users/change-password", authLimiter);

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/v1/newsletter/subscribe", strictLimiter);
app.use("/api/v1/orders", strictLimiter);

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/v1/cart", apiLimiter);

// Serve static files in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../../dist");
const frontendPath = path.resolve(__dirname, "../../frontend");

// In production, serve built frontend files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true,
  }));
  app.use("/images", express.static(path.join(distPath, "images"), {
    maxAge: '30d',
    etag: true,
  }));
} else {
  // In development, serve frontend images directly
  app.use("/images", express.static(path.join(frontendPath, "images")));
}

// Middleware
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:8000", "http://localhost:4000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// CSRF protection for state-changing requests
app.use(csrfProtection);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// CSRF token endpoint for frontend
app.get("/api/v1/csrf-token", getCsrfToken);

app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/posts", postsRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);
app.use("/api/v1/orders", orderRoutes);

// Multer error handler
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "File too large. Maximum size is 5MB",
    });
  }
  if (err.message && err.message.includes("File type")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }
  next(err);
});

const PORT = process.env.PORT || 8100;
/**
 * Starts the server and listens on the specified port.
 *
 * @return {Promise<void>} - A promise that resolves when the server is started.
 */
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`App is running on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
