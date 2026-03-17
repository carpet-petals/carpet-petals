const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: String, default: "" },
    description: { type: String, default: "" },
    material: { type: String, default: "" },
    dimensions: { type: String, default: "" },
    images: [{ type: String }],
    featured: { type: Boolean, default: false },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);