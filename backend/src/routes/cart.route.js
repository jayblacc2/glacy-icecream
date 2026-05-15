import express from "express";
import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
  syncCart,
  updateCartItem,
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getCart);
router.route("/add").post(addToCart);
router.route("/update").put(updateCartItem);
router.route("/remove/:productId").delete(removeFromCart);
router.route("/clear").delete(clearCart);
router.route("/sync").post(syncCart);

export default router;
