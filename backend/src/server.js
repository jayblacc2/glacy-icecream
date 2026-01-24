import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import productsRoutes from "./routes/products.route.js";
import usersRoutes from "./routes/users.route.js";

dotenv.config({
  path: "./.env",
});

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/products", productsRoutes);

const PORT = process.env.PORT || 8100;
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
