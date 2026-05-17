import express from "express";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from "../controllers/posts.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { optionalUpload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.route("/").get(getPosts);
router.route("/:id").get(getPost);
router.route("/create").post(protect, adminOnly, optionalUpload("image"), createPost);
router.route("/update/:id").put(protect, adminOnly, updatePost);
router.route("/delete/:id").delete(protect, adminOnly, deletePost);

export default router;
