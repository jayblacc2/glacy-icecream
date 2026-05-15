import "./config/env.config.js";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import cartRoutes from "./routes/cart.route.js";
import orderRoutes from "./routes/order.route.js";
import postsRoutes from "./routes/posts.route.js";
import productsRoutes from "./routes/products.route.js";
import usersRoutes from "./routes/users.route.js";

const app = express();

// Serve static files in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../../dist");
const frontendPath = path.resolve(__dirname, "../../frontend");

// In production, serve built frontend files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(distPath));
  app.use("/images", express.static(path.join(distPath, "images")));
} else {
  // In development, serve frontend images directly
  app.use("/images", express.static(path.join(frontendPath, "images")));
}

// Middleware
app.use(
  cors({
    origin: ["http://localhost:8000", "http://localhost:4000"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/posts", postsRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);

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
