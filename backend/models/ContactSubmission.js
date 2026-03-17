const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  message: { type: String, required: true },
  attachments: [{ type: String }],
  sentAt: { type: Date, default: Date.now },
});

const contactSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    message: { type: String, required: true },
    attachments: [{ type: String }],
    selectedProducts: [{ id: String, title: String }],
    selectedCategories: [{ id: String, name: String }],
    status: { type: String, enum: ["open", "closed"], default: "open" },
    important: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    replies: [replySchema],
    // Email threading — store the original Message-ID
    emailMessageId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactSubmission", contactSubmissionSchema);