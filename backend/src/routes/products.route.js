import express from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/products.controller.js";
import upload from "../middleware/upload.middleware.js";

const Route = express.Router();

Route.route("/create").post(upload.single("image"), createProduct );
Route.route("/").get(getProducts);
Route.route("/:id").get(getProduct);
Route.route("/update/:id").put(updateProduct);
Route.route("/delete/:id").delete(deleteProduct);

export default Route;
