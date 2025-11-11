const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    curriculum: { type: mongoose.Schema.Types.ObjectId, ref: 'Curriculum' },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tutorHistory: [
      {
        tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        assignedAt: { type: Date, default: Date.now }, // timestamp of assignment
      },
    ],
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    startDate: Date,
    endDate: Date,

    activitiesDoneByType: {
      Basic: { type: [String], default: [] },
      Plus: { type: [String], default: [] },
      Pro: { type: [String], default: [] },
    },

    progressByType: {
      Basic: { type: Number, default: 0 },
      Plus: { type: Number, default: 0 },
      Pro: { type: Number, default: 0 },
    },

    unlockedPackages: {
      type: [String],
      default: ['Basic'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Batch', BatchSchema);
