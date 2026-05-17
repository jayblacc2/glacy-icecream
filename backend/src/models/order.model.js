import mongoose from 'mongoose';
import crypto from 'crypto';

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      address: { type: String },
      phone: { type: String },
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'paypal'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    orderNumber: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Indexes for frequent queries
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

// Generate order number before saving
OrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const uniqueId = crypto.randomUUID().replace(/-/g, '').substring(0, 12).toUpperCase();
    this.orderNumber = `GLC-${uniqueId}`;
  }
  next();
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;
