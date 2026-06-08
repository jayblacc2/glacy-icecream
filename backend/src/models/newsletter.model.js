import crypto from 'crypto';
import mongoose from 'mongoose';

const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  confirmToken: {
    type: String,
    index: true,
  },
  confirmTokenExpires: {
    type: Date,
  },
}, { timestamps: true });

NewsletterSchema.methods.generateConfirmToken = function () {
  this.confirmToken = crypto.randomBytes(32).toString('hex');
  this.confirmTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  return this.confirmToken;
};

const Newsletter = mongoose.model('Newsletter', NewsletterSchema);
export default Newsletter;
