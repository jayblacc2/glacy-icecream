import mongoose from "mongoose";
import Product from "../models/product.model.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.util.js";

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const trimmedName = name.trim();

    // Validate price
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number",
      });
    }

    // Validate required fields
    if (!trimmedName || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, description, price, category",
      });
    }

    // Check for existing product (case-insensitive)
    const existingProduct = await Product.findOne({
      name: { $regex: `^${trimmedName}$`, $options: "i" },
    });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product with this name already exists",
      });
    }

    // Validate category
    const validCategories = Product.schema.path("category").enumValues;
    if (!validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Valid categories: ${validCategories.join(", ")}`,
      });
    }

    // Handle image upload
    let imageData = null;
    let uploadedPublicId = null;

    if (req.file) {
      try {
        const { public_id, secure_url } = await uploadImage(req.file.buffer);
        uploadedPublicId = public_id;
        imageData = {
          publicId: public_id,
          url: secure_url,
        };
      } catch (error) {
        console.error("Error uploading image:", error);
        return res.status(500).json({
          success: false,
          message: "Error uploading image",
        });
      }
    }

    // Create product
    try {
      const product = await Product.create({
        name: trimmedName,
        description,
        price,
        image: imageData,
        category: category.toLowerCase(),
      });

      res.status(201).json({
        success: true,
        message: "Product added successfully",
        product: {
          id: product.id,
          name: product.name, // ✅ Fixed
          description: product.description,
          price: product.price,
          category: product.category,
          image: product.image,
        },
      });
    } catch (error) {
      // Cleanup uploaded image
      if (uploadedPublicId) {
        await deleteImage(uploadedPublicId).catch((err) => console.error(err));
      }
      console.error("Error creating product:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all products with optional category filtering and pagination
const getProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const category = req.query.category?.trim().toLowerCase();

    const filter = {};

    if (category) {
      const validCategories = Product.schema.path("category").enumValues;
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Valid categories: ${validCategories.join(", ")}`,
        });
      }
      filter.category = category;
    }

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).skip(skip).limit(limit),
    ]);

    if (products.length === 0) {
      const message = category
        ? `No products found in category: ${category}`
        : total > 0
          ? "No products found on this page"
          : "No products available";

      return res.status(404).json({
        success: false,
        message,
      });
    }
    const totalPages = Math.ceil(total / limit);

    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
    return res.status(200).json({
      success: true,
      message: category
        ? `Products in ${category} category retrieved successfully`
        : "Products retrieved successfully",
      products: transformedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      ...(category && { filter: { category } }),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Get a single product by ID
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, message: "Product found", product });
  } catch (error) {
    console.error("Internal server error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// update product by id

const updateProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid product ID" });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (req.file) {
      try {
        const result = await uploadImage(req.file.buffer);
        updatedProduct.image = {
          url: result.secure_url,
          publicId: result.public_id,
        };
        await updatedProduct.save();
      } catch (error) {
        console.error("Error uploading image:", error);
        return res.status(500).json({
          success: false,
          message: "Error uploading image",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//delete product
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid product ID" });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(id); //
    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Optional: Delete image from Cloudinary
    if (deletedProduct.image) {
      try {
        const publicId = deletedProduct.image.publicId;
        await deleteImage(publicId);
      } catch (err) {
        console.warn("Failed to delete image from Cloudinary:", err);
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
export { createProduct, deleteProduct, getProduct, getProducts, updateProduct };
