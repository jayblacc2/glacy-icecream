import express from "express";
import { getPost, getPosts } from "../controllers/posts.controller.js";
const router = express.Router();

router.route("/posts").get(getPosts);
router.route("/posts/:id").get(getPost);

export default router;
