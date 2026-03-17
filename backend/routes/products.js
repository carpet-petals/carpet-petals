const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Category = require("../models/Category");
const auth = require("../middleware/auth");
const { deleteManyFromCloudinary } = require("../utils/cloudinary");

function slugify(text) {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

// GET all — public
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.featured) filter.featured = true;
    if (req.query.subcategory) filter.subcategory = req.query.subcategory;
    if (req.query.category) {
      const cat = await Category.findOne({ slug: req.query.category });
      if (cat) filter.category = cat._id;
    }
    const products = await Product.find(filter).populate("category").sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET by ID — public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST — admin
router.post("/", auth, async (req, res) => {
  try {
    const { title, category, subcategory, description, material, dimensions, images, featured, seo } = req.body;
    const slug = slugify(title) + "-" + Date.now();
    const product = await Product.create({
      title, slug, category, subcategory, description,
      material, dimensions, images: images || [],
      featured: featured || false, seo: seo || {},
    });
    await product.populate("category");
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT — admin (also cleans up removed images from Cloudinary)
router.put("/:id", auth, async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });

    const { title, category, subcategory, description, material, dimensions, images, featured, seo } = req.body;

    // Find images that were removed and delete from Cloudinary
    const newImages = images || [];
    const removedImages = (existing.images || []).filter((img) => !newImages.includes(img));
    if (removedImages.length > 0) {
      await deleteManyFromCloudinary(removedImages);
    }

    const update = { category, subcategory, description, material, dimensions, images: newImages, featured, seo: seo || {} };
    if (title) { update.title = title; update.slug = slugify(title) + "-" + Date.now(); }

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true }).populate("category");
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE — admin (deletes all images from Cloudinary first)
router.delete("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Not found" });

    // Delete all product images from Cloudinary
    if (product.images?.length > 0) {
      await deleteManyFromCloudinary(product.images);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product and images deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;