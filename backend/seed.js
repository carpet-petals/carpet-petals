const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Category = require("./models/Category");

const categories = [
  {
    name: "Hand Knotted",
    slug: "hand-knotted",
    description: "Individually knotted by skilled artisans — the most premium and durable carpet-making technique.",
    coverImage: "",
    order: 1,
    subcategories: [
      { name: "Traditional", slug: "traditional" },
      { name: "Modern", slug: "modern" },
    ],
  },
  {
    name: "Hand Woven",
    slug: "hand-woven",
    description: "Woven on looms by hand — versatile styles ranging from rustic Gabbeh to flat Durries.",
    coverImage: "",
    order: 2,
    subcategories: [
      { name: "Loom Lori (Gabbeh)", slug: "loom-lori-gabbeh" },
      { name: "Shaggy", slug: "shaggy" },
      { name: "Flat Weave (Durrie)", slug: "flat-weave-durrie" },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const cat of categories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (exists) {
        console.log(`Skipped (already exists): ${cat.name}`);
      } else {
        await Category.create(cat);
        console.log(`Created: ${cat.name}`);
      }
    }

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  }
}

seed();