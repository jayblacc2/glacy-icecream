import Newsletter from '../models/newsletter.model.js';

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
      return res.status(200).json({ success: true, message: 'Already subscribed!' });
    }

    await Newsletter.create({ email: trimmedEmail });
    res.status(201).json({ success: true, message: 'Subscribed successfully!' });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { subscribe };
