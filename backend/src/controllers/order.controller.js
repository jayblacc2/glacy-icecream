import crypto from 'crypto';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';

// Create order from cart (checkout)
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod = 'cash' } = req.body;

    // Get user with cart
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if cart is empty
    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    // Re-fetch product prices from DB to prevent price manipulation
    const productIds = user.cart.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const priceMap = new Map();
    const stockMap = new Map();
    products.forEach((p) => {
      priceMap.set(p._id.toString(), { price: p.price, name: p.name, image: p.image, stock: p.stock ?? 0 });
      stockMap.set(p._id.toString(), p.stock ?? 0);
    });

    // Check stock availability
    for (const cartItem of user.cart) {
      const productId = cartItem.productId.toString();
      const available = stockMap.get(productId) ?? 0;
      if (available < cartItem.quantity) {
        const product = priceMap.get(productId);
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product?.name || 'item'} (available: ${available}, requested: ${cartItem.quantity})`,
        });
      }
    }

    // Build order items with verified prices
    let totalAmount = 0;
    const orderItems = user.cart.map((cartItem) => {
      const productId = cartItem.productId.toString();
      const verifiedProduct = priceMap.get(productId);
      const price = verifiedProduct ? verifiedProduct.price : cartItem.price;
      const itemTotal = price * cartItem.quantity;
      totalAmount += itemTotal;

      return {
        productId: cartItem.productId,
        name: verifiedProduct ? verifiedProduct.name : cartItem.name,
        price,
        quantity: cartItem.quantity,
        image: verifiedProduct ? verifiedProduct.image : cartItem.image,
      };
    });

    // Create order with verified prices
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress: shippingAddress || {},
      paymentMethod,
    });

    // Clear user's cart
    user.cart = [];
    await user.save();

    // Decrement product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all orders for logged-in user
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Order.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      orders: orders.map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        itemCount: order.items.length,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: id, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: id, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Only allow cancellation if status is 'pending' or 'processing'
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .select('-__v');

    const total = await Order.countDocuments({});

    res.status(200).json({
      success: true,
      orders: orders.map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        itemCount: order.items.length,
        user: order.user ? { id: order.user._id, name: order.user.name, email: order.user.email } : null,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { createOrder, getUserOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus };
