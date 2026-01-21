import mongoose from "mongoose";
import Product from "../models/product.model.js";

const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, description, price, category",
      });
    }

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product with this name already exists",
      });
    }

    const validCategories = Product.schema.path("category").enumValues;
    if (!validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Valid categories: ${validCategories.join(
          ", "
        )}`,
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image,
      category: category.toLowerCase(),
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments({});
    const products = await Product.find({}).skip(skip).limit(limit);

    if (products.length === 0 && total > 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products found on this page" });
    }

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Internal server error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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

// Get all products by category
const getProductsByCategories = async (req, res) => {
  try {
    const { category } = req.params;
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Category parameter is required" });
    }

    const validCategories = Product.Schema.path("category").enumValues;
    if (!validCategories.includes(category.toLowerCase())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category parameter" });
    }

    const products = await Product.find({ category: category.toLowerCase() });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No products found in category: ${category}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Products in ${category} category retrieved successfully`,
      products,
      total: products.length,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
      res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      updateProduct,
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
    const deletedProduct = await findByIdAndDelete(id);
    if (!deleteProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Product deleted absolutely" });
  } catch (error) {
    console.error("Error updating product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  getProductsByCategories,
  updateProduct,
};
