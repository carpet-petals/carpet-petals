const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const { deleteFromCloudinary, deleteManyFromCloudinary } = require("../utils/cloudinary");

function slugify(text) {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { name, description, coverImage, order, subcategories, seo } = req.body;
    const slug = slugify(name);
    const subs = (subcategories || []).map((s) => ({ name: s.name, slug: slugify(s.name) }));
    const category = await Category.create({
      name, slug, description, coverImage,
      order: order || 0, subcategories: subs, seo: seo || {},
    });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const existing = await Category.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });
    const { name, description, coverImage, order, subcategories, seo } = req.body;
    if (existing.coverImage && existing.coverImage !== coverImage) {
      await deleteFromCloudinary(existing.coverImage);
    }
    const update = {
      description, order, seo: seo || {},
      coverImage: coverImage || "",
      ...(name && { name, slug: slugify(name) }),
      ...(subcategories && {
        subcategories: subcategories.map((s) => ({ name: s.name, slug: slugify(s.name) })),
      }),
    };
    const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Not found" });

    // Delete category cover image from Cloudinary
    if (category.coverImage) {
      await deleteFromCloudinary(category.coverImage);
    }

    // Find all products in this category
    const products = await Product.find({ category: req.params.id });

    // Delete all images of all products from Cloudinary
    for (const product of products) {
      if (product.images?.length > 0) {
        await deleteManyFromCloudinary(product.images);
      }
    }

    // Delete all products in this category
    const deletedProducts = await Product.deleteMany({ category: req.params.id });
    console.log(`Cascade deleted ${deletedProducts.deletedCount} products for category: ${category.name}`);

    // Delete the category
    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Category deleted along with ${deletedProducts.deletedCount} associated products`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;