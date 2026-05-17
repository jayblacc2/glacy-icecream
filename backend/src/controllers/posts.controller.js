import mongoose from "mongoose";
import Post from "../models/post.model.js";

const getPosts = async (req, res) => {
  try {
    // Extract pagination parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.",
      });
    }

    // Get total count for pagination metadata
    const totalPosts = await Post.countDocuments();

    // Get paginated posts
    const posts = await Post.find()
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalPosts / limit);

    return res.status(200).json({
      success: true,
      message: "Posts retrieved successfully",
      data: posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Posts error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPost = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Increment view count
    post.views = (post.views || 0) + 1;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post retrieved successfully",
      data: {
        id: post._id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        publishedAt: post.publishedAt,
        featuredImage: post.featuredImage,
        views: post.views,
        formattedDate: post.formattedDate,
      },
    });
  } catch (error) {
    console.error("Posts error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createPost = async (req, res) => {
  const { title, excerpt, content, author, featuredImage } = req.body;

  try {
    if (!title || !excerpt || !content || !author) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newPost = await Post.create({
      title: title.toLowerCase(),
      excerpt,
      content,
      author,
      featuredImage,
    });

    if (!newPost) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to create post" });
    }

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    console.error("Posts error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid post Id" });
    }
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    const { title, excerpt, content, author, featuredImage } = req.body;
    if (!title || !excerpt || !content || !author) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, excerpt, content, author, featuredImage },
      { new: true, runValidators: true }
    );
    if (!updatedPost)
      return res
        .status(400)
        .json({ success: false, message: "Post not found" });

    res
      .status(200)
      .json({
        success: true,
        message: "Post updated successfully",
        data: updatedPost,
      });
  } catch (error) {
    console.error("Posts error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { createPost, deletePost, getPost, getPosts, updatePost };

