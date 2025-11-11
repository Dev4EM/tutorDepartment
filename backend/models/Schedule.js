const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  title: String,
  date: Date,
  description: String,
  isBookmarked: { type: Boolean, default: false },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Schedule', scheduleSchema);
