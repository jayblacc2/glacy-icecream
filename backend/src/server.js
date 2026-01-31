import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import postsRoutes from "./routes/posts.route.js";
import productsRoutes from "./routes/products.route.js";
import usersRoutes from "./routes/users.route.js";

dotenv.config({
  path: "./.env",
});

const app = express();

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
