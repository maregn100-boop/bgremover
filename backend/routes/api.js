const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

const upload = multer({ dest: 'uploads/' });
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// simple auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.userId = data.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// get user info
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('-passwordHash');
  res.json(user);
});

// remove background endpoint (mock or using remove.bg if API key provided)
router.post('/remove-bg', auth, upload.single('image'), async (req, res) => {
  const user = await User.findById(req.userId);
  // check paid status and trials
  const now = Date.now();
  if (user.isPaid && user.accessExpiresAt && now > new Date(user.accessExpiresAt).getTime()) {
    user.isPaid = false;
    user.accessExpiresAt = null;
    await user.save();
  }

  if (!user.isPaid) {
    if (user.trialsUsed >= 5) {
      return res.status(402).json({ error: 'Free trials exhausted. Please pay.' });
    }
    user.trialsUsed += 1;
    await user.save();
  }

  // For now we simply return the uploaded file path as "processed"
  // Replace this with real background removal API (e.g., remove.bg) integration
  const file = req.file;
  const processedPath = path.join('uploads', 'processed-' + file.filename + path.extname(file.originalname));
  fs.copyFileSync(file.path, processedPath);

  res.json({ message: 'Processed (mock)', url: '/' + processedPath });
});

// initiate mock payment (replace with Telebirr API integration later)
router.post('/pay', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  const orderId = 'ORDER-' + Date.now();
  user.pendingPaymentId = orderId;
  await user.save();
  // Instead of calling Telebirr, return a mock payment URL
  res.json({ paymentUrl: '/mock-pay?orderId=' + orderId });
});

// mock payment page (for testing)
router.get('/mock-pay', async (req, res) => {
  const { orderId } = req.query;
  // In real life Telebirr would handle payment and call your callback.
  res.send(`
    <h2>Mock Payment Page</h2>
    <p>Order: ${orderId}</p>
    <form method="POST" action="/api/pay/mock-callback">
      <input type="hidden" name="orderId" value="${orderId}" />
      <button type="submit">Simulate Successful Payment (3 ETB)</button>
    </form>
  `);
});

// mock callback handler to simulate Telebirr callback
router.post('/pay/mock-callback', express.urlencoded({ extended: true }), async (req, res) => {
  const { orderId } = req.body;
  const user = await User.findOne({ pendingPaymentId: orderId });
  if (!user) return res.status(404).send('Order not found');
  user.isPaid = true;
  user.accessExpiresAt = new Date(Date.now() + 24*60*60*1000); // +1 day
  user.pendingPaymentId = null;
  await user.save();
  res.send('<h3>Payment simulated. Access granted for 24 hours.</h3><a href="/">Close</a>');
});

module.exports = router;
