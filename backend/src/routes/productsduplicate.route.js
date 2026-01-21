import express from "express";
const router = express.Router();

// GET /api/v1/products - Get all products
router.get("/products", (req, res) => {
  // Your logic to fetch all ice creams
  res.json({ message: "Get all products" });
});

// GET /api/v1/products/:id - Get specific product
router.get("/products/:id", (req, res) => {
  const { id } = req.params;
  // Your logic to fetch specific ice cream
  res.json({ message: `Get product with id: ${id}` });
});

// GET /api/v1/products/categories - Get all categories
router.get("/products/categories", (req, res) => {
  // Your logic to fetch categories
  res.json({ message: "Get all categories" });
});

// GET /api/v1/products/category/:name - Get products by category
router.get("/products/category/:name", (req, res) => {
  const { name } = req.params;
  // Your logic to fetch products by category
  res.json({ message: `Get products in category: ${name}` });
});

// POST /api/v1/products - Create new product (admin)
router.post("/products", (req, res) => {
  // Your logic to create new product
  res.status(201).json({ message: "Product created" });
});

// PUT /api/v1/products/:id - Update product (admin)
router.put("/products/:id", (req, res) => {
  const { id } = req.params;
  // Your logic to update product
  res.json({ message: `Product ${id} updated` });
});

// DELETE /api/v1/products/:id - Delete product (admin)
router.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  // Your logic to delete product
  res.json({ message: `Product ${id} deleted` });
});

export default router;
