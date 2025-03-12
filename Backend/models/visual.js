const mongoose = require("mongoose");

const visualSchema = new mongoose.Schema(
  {
    child_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
      required: true,
    },
    date_taken: { type: Date, default: Date.now },
    test_name: { type: String, default: "Visual Discrimination Test" },
    options: { type: [String], required: true },
  },
  { collection: "VisualTest" }
);

module.exports = mongoose.model("Visual", visualSchema);
