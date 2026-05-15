 import express from "express";
import {
  registerUser,
  userLogin,
  userLogout,
  deleteUser,
  checkAuthStatus,
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadAvatar,
} from "../controllers/users.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(userLogin);
router.route("/logout").post(userLogout);
router.route("/delete/:id").delete(protect, deleteUser);
router.route("/check-auth").get(checkAuthStatus);

// Protected routes for profile management
router.route("/profile").get(protect, getUserProfile);
router.route("/profile").put(protect, updateUserProfile);
router.route("/change-password").put(protect, changePassword);
router.route("/avatar").post(protect, upload.single("avatar"), uploadAvatar);

export default router;
