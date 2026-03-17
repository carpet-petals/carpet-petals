const mongoose = require("mongoose");

const siteContentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      unique: true,
      enum: ["hero", "about", "payment", "contact", "aboutus", "faq"],
    },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteContent", siteContentSchema);