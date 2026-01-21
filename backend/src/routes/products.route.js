import express from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  getProductsByCategories,
  updateProduct,
} from "../controllers/products.controller.js";

const Route = express.Router();

Route.route("/create").post(createProduct);
Route.route("/").get(getProducts);
Route.route("/:id").get(getProduct);
Route.route("/category/:category").get(getProductsByCategories);
Route.route("/update/:id").put(updateProduct);
Route.route("/delete/:id").delete(deleteProduct);

export default Route;
