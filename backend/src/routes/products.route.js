import express from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/products.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { optionalUpload } from "../middleware/upload.middleware.js";

const Route = express.Router();

Route.route("/create").post(protect, adminOnly, optionalUpload("image"), createProduct);
Route.route("/").get(getProducts);
Route.route("/:id").get(getProduct);
Route.route("/update/:id").put(protect, adminOnly, optionalUpload("image"), updateProduct);
Route.route("/delete/:id").delete(protect, adminOnly, deleteProduct);

export default Route;
