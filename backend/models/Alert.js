const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  message: String,
  type: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  forAll: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
