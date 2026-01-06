const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    taskType: {
      type: String,
      enum: ["daily", "occasional"],
      required: true,
    },

    // ✅ Date-wise status storage
    statusByDate: {
      type: Map,
      of: {
        type: String,
        enum: ["pending", "completed", "missed"],
        default: "pending",
      },
    },
  },
  { timestamps: true }
);

// ✅ Optional: pre-save hook to ensure ObjectId conversion
scheduleSchema.pre("save", function (next) {
  if (this.isModified("assignedTo") && typeof this.assignedTo === "string") {
    this.assignedTo = mongoose.Types.ObjectId(this.assignedTo);
  }
  if (this.isModified("createdBy") && typeof this.createdBy === "string") {
    this.createdBy = mongoose.Types.ObjectId(this.createdBy);
  }
  next();
});

module.exports = mongoose.model("Schedule", scheduleSchema);
