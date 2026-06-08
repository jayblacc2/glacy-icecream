import Newsletter from '../models/newsletter.model.js';
import { sendConfirmationEmail, sendWelcomeEmail } from '../utils/mailer.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const trimmedEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const existing = await Newsletter.findOne({ email: trimmedEmail });

    if (existing) {
      if (existing.confirmed) {
        return res.status(200).json({ success: true, message: 'Already subscribed!' });
      }

      // Resend confirmation for unconfirmed subscriptions
      existing.generateConfirmToken();
      await existing.save();
      await sendConfirmationEmail(trimmedEmail, existing.confirmToken);
      return res.status(200).json({
        success: true,
        message: 'Confirmation email resent! Please check your inbox.',
      });
    }

    // New subscription — create unconfirmed with token
    const sub = new Newsletter({ email: trimmedEmail });
    sub.generateConfirmToken();
    await sub.save();

    await sendConfirmationEmail(trimmedEmail, sub.confirmToken);

    res.status(201).json({
      success: true,
      message: 'Please check your email to confirm your subscription.',
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const confirm = async (req, res) => {
  try {
    const { token, email } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';

    if (!token || !email) {
      return res.redirect(`${frontendUrl}/confirm-subscription?message=${encodeURIComponent('Missing confirmation parameters')}&success=false`);
    }

    const trimmedEmail = email.toLowerCase().trim();
    const sub = await Newsletter.findOne({
      email: trimmedEmail,
      confirmToken: token,
      confirmTokenExpires: { $gt: new Date() },
    });

    if (!sub) {
      return res.redirect(`${frontendUrl}/confirm-subscription?message=${encodeURIComponent('Invalid or expired confirmation link')}&success=false`);
    }

    sub.confirmed = true;
    sub.confirmToken = undefined;
    sub.confirmTokenExpires = undefined;
    await sub.save();

    await sendWelcomeEmail(trimmedEmail).catch(() => {});

    res.redirect(`${frontendUrl}/confirm-subscription?message=${encodeURIComponent('Subscription confirmed! Welcome to Glacy Store.')}&success=true`);
  } catch (error) {
    console.error('Newsletter confirm error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
    res.redirect(`${frontendUrl}/confirm-subscription?message=${encodeURIComponent('Confirmation failed. Please try again.')}&success=false`);
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const trimmedEmail = email.toLowerCase().trim();

    if (token) {
      // Verified unsubscribe with token
      const sub = await Newsletter.findOne({ email: trimmedEmail, confirmToken: token });
      if (!sub) {
        return res.status(400).json({ success: false, message: 'Invalid unsubscribe link' });
      }
      await Newsletter.deleteOne({ _id: sub._id });
    } else {
      // For future: add rate-limited unauthenticated unsubscribe
      return res.status(400).json({ success: false, message: 'Unsubscribe token required' });
    }

    res.json({ success: true, message: 'Unsubscribed successfully.' });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { confirm, subscribe, unsubscribe };
