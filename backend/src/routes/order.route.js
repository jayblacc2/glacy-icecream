import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Admin routes (must be before /:id to avoid route clash)
router.route('/admin').get(protect, adminOnly, getAllOrders);
router.route('/admin/:id/status').put(protect, adminOnly, updateOrderStatus);

// All order routes are protected
router.route('/').post(protect, createOrder);
router.route('/').get(protect, getUserOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/cancel').put(protect, cancelOrder);

export default router;
