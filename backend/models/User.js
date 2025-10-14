const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  passwordHash: String,
  trialsUsed: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  accessExpiresAt: { type: Date, default: null },
  pendingPaymentId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', UserSchema);
