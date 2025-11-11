const mongoose = require('mongoose');

const CurriculumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    columns: [{ type: String, required: true }],
    rows: [
      {
        type: Object, // ✅ use Object instead of Map
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // references the User model
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Curriculum', CurriculumSchema);
