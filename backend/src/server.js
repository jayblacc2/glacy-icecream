import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import productsRoutes from "./routes/products.route.js";

dotenv.config({
  path: "./.env",
});

const app = express();
app.use(express.json());
app.use("/api/v1/products", productsRoutes);

const PORT = process.env.PORT || 8000;
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
