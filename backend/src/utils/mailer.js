import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Dev fallback: log to console instead of sending real emails
    transporter = {
      sendMail: async (opts) => {
        console.log('---[DEV MAIL]---');
        console.log(`To:      ${opts.to}`);
        console.log(`Subject: ${opts.subject}`);
        console.log(`Body:\n${opts.text || opts.html}`);
        console.log('----------------');
      },
    };
  }

  return transporter;
}

async function sendConfirmationEmail(email, confirmToken) {
  const apiUrl = process.env.BASE_URL || 'http://localhost:8000';
  const confirmUrl = `${apiUrl}/api/v1/newsletter/confirm?token=${confirmToken}&email=${encodeURIComponent(email)}`;

  const subject = 'Confirm your Glacy Store newsletter subscription';
  const text = `Thank you for subscribing to the Glacy Store newsletter!\n\nPlease confirm your email address by clicking the link below:\n\n${confirmUrl}\n\nIf you did not request this, please ignore this email.\n\nThe link expires in 24 hours.`;
  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
    <h2 style="color:#e84393;">Glacy Store</h2>
    <p>Thank you for subscribing!</p>
    <p>Please confirm your email address by clicking the button below:</p>
    <p style="text-align:center;">
      <a href="${confirmUrl}"
         style="display:inline-block;padding:12px 28px;background:#e84393;color:#fff;text-decoration:none;border-radius:6px;">
        Confirm Subscription
      </a>
    </p>
    <p style="font-size:0.85em;color:#666;">If you did not request this, please ignore this email.<br>The link expires in 24 hours.</p>
  </div>`;

  const t = getTransporter();
  await t.sendMail({ from: process.env.SMTP_FROM || 'noreply@glacystore.com', to: email, subject, text, html });
}

async function sendWelcomeEmail(email) {
  const subject = 'Welcome to the Glacy Store newsletter!';
  const text = `You're now confirmed! We'll keep you posted on the latest flavors, deals, and events at Glacy Store.\n\nIf you'd like to unsubscribe at any time, visit our website or contact us.`;
  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
    <h2 style="color:#e84393;">Welcome to Glacy Store!</h2>
    <p>You're now confirmed! 🎉</p>
    <p>We'll keep you posted on the latest flavors, deals, and events.</p>
    <p style="font-size:0.85em;color:#666;">If you'd like to unsubscribe, visit your profile or contact us.</p>
  </div>`;

  const t = getTransporter();
  await t.sendMail({ from: process.env.SMTP_FROM || 'noreply@glacystore.com', to: email, subject, text, html });
}

export { sendConfirmationEmail, sendWelcomeEmail };
