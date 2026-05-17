import User from "../models/user.model.js";
import Product from "../models/product.model.js";

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const user = req.user;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      user.cart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: Number(quantity),
        image: product.image?.url || "",
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart: user.cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getCart = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      cart: user.cart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = req.user;

    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const item = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    item.quantity = Number(quantity);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: user.cart,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = req.user;

    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: user.cart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const user = req.user;
    user.cart = [];
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart: user.cart,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const syncCart = async (req, res) => {
  try {
    const { items } = req.body;
    const user = req.user;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Cart items array is required",
      });
    }

    // Replace cart with synced items
    user.cart = items.map((item) => ({
      productId: item.productId || item.id || item._id,
      name: item.name,
      price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 1,
      image: item.image?.url || item.image || '',
    }));

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Cart synced',
      cart: user.cart,
    });
  } catch (error) {
    console.error('Error syncing cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export { addToCart, clearCart, getCart, removeFromCart, syncCart, updateCartItem };
