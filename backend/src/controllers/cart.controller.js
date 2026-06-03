import User from "../models/user.model.js";
import Product from "../models/product.model.js";

/* ==========================================================
   HELPERS
   ========================================================== */

/**
 * Overwrite each cart item's price/name/image with the current
 * product data from the DB. Items whose productId no longer
 * exists in the Product collection are flagged rather than
 * silently kept with stale data.
 *
 * Returns an array of { validItems, missingIds }.
 */
async function enrichCartWithCurrentProducts(cartItems) {
  if (!cartItems || cartItems.length === 0) {
    return { validItems: [], missingIds: [] };
  }

  const productIds = cartItems.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map();
  products.forEach((p) => {
    productMap.set(p._id.toString(), p);
  });

  const missingIds = [];
  const validItems = [];

  for (const item of cartItems) {
    const pid = item.productId.toString();
    const current = productMap.get(pid);

    if (current) {
      validItems.push({
        productId: item.productId,
        name: current.name,
        price: current.price,
        quantity: item.quantity,
        image: current.image?.url || "",
      });
    } else {
      missingIds.push(pid);
    }
  }

  return { validItems, missingIds };
}

/* ==========================================================
   ENDPOINTS
   ========================================================== */

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
      existingItem.price = product.price;
      existingItem.name = product.name;
      existingItem.image = product.image?.url || "";
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

    const { validItems, missingIds } = await enrichCartWithCurrentProducts(user.cart);

    if (missingIds.length > 0) {
      user.cart = validItems;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      cart: validItems,
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

    const product = await Product.findById(productId);
    if (product) {
      item.price = product.price;
      item.name = product.name;
      item.image = product.image?.url || "";
    }

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

    // Build a lookup of existing cart items keyed by productId.
    const existingMap = new Map();
    for (const ci of user.cart) {
      existingMap.set(ci.productId.toString(), ci);
    }

    // Only extract productId + quantity from the client; resolve
    // everything else from the Product DB to prevent price forgery.
    // Merge guest items into the existing cart instead of replacing.
    const errors = [];
    let changed = false;

    for (const item of items) {
      const rawId = item.productId || item.id || item._id;
      const quantity = parseInt(item.quantity) || 1;

      if (!rawId) {
        errors.push("Item missing productId");
        continue;
      }

      const product = await Product.findById(rawId);

      if (product) {
        const pid = product._id.toString();
        const existing = existingMap.get(pid);

        if (existing) {
          existing.quantity += quantity;
          existing.price = product.price;
          existing.name = product.name;
          existing.image = product.image?.url || "";
        } else {
          user.cart.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.image?.url || "",
          });
        }
        changed = true;
      } else {
        errors.push(`Product not found: ${rawId}`);
      }
    }

    if (changed) await user.save();

    return res.status(200).json({
      success: true,
      message: "Cart synced",
      cart: user.cart,
      ...(errors.length > 0 && { errors }),
    });
  } catch (error) {
    console.error("Error syncing cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { addToCart, clearCart, getCart, removeFromCart, syncCart, updateCartItem };
