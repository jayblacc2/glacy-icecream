import express from "express";
import { getPost, getPosts } from "../controllers/posts.controller.js";
const router = express.Router();

router.route("/").get(getPosts);
router.route("/:id").get(getPost);

export default router;
