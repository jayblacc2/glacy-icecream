 import express from "express";
import {
  registerUser,
  userLogin,
  userLogout,
  deleteUser,
  checkAuthStatus,
} from "../controllers/users.controller.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(userLogin);
router.route("/logout").post(userLogout);
router.route("/delete/:id").delete(deleteUser);
router.route("/check-auth").get(checkAuthStatus);


export default router;
