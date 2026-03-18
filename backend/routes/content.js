const express = require("express");
const router = express.Router();
const SiteContent = require("../models/SiteContent");
const auth = require("../middleware/auth");
const { deleteFromCloudinary } = require("../utils/cloudinary");

// Sections that contain image fields and where to find them
const IMAGE_FIELDS = {
  hero:    ["backgroundImage"],
  about:   ["image"],
  payment: ["upiQrImage"],
};

const DEFAULTS = {
  hero: {
    backgroundImage: "",
    tagline: "Handmade Carpets Crafted with Heritage",
    subtext: "Tibetan, Persian, and handmade carpets — woven by skilled artisans in Varanasi.",
  },
  about: {
    image: "",
    headline: "A Legacy of Craft from Varanasi",
    body: "Founded in 2016, Carpet Petals is a Varanasi-based manufacturer, supplier, and trader of premium handmade carpets.",
    established: "2016",
    location: "Varanasi, India",
  },
  payment: {
    upi: "",
    upiQrImage: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifsc: "",
    disclaimer: "Please contact us before making any payment.",
  },
  contact: {
    phone: "",
    whatsapp: "",
    email: "",
    address: "Plot No. D-1, Small Industrial Estate, Chandpur, Varanasi, UP 221106, India",
    mapEmbedUrl: "",
    instagramUrl: "",
    facebookUrl: "",
  },
  aboutus: {
    title: "About Carpet Petals",
    content: "Founded in 2016 in the heart of Varanasi, Carpet Petals is a manufacturer, supplier and exporter of premium handmade carpets. Our artisans carry forward centuries of weaving tradition, creating pieces that bring warmth and character to spaces around the world.",
  },
  faq: {
    items: [
      { question: "Do you accept custom orders?",       answer: "Yes, we accept custom orders for sizes, colours and patterns. Contact us with your requirements." },
      { question: "Do you export internationally?",     answer: "Yes, we supply to buyers globally. We handle packaging and export documentation." },
      { question: "What materials do you use?",         answer: "We use pure wool, silk blends and cotton depending on the carpet type and your requirements." },
      { question: "What is your minimum order quantity?", answer: "MOQ varies by product. Please contact us directly to discuss your specific requirements." },
    ],
  },
};

// GET — public
router.get("/:section", async (req, res) => {
  try {
    const { section } = req.params;
    if (!DEFAULTS[section]) return res.status(404).json({ success: false, message: "Invalid section" });

    const content = await SiteContent.findOne({ section });
    res.json({ success: true, data: content ? content.data : DEFAULTS[section] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT — admin (deletes old Cloudinary images when replaced)
router.put("/:section", auth, async (req, res) => {
  try {
    const { section } = req.params;
    if (!DEFAULTS[section]) return res.status(404).json({ success: false, message: "Invalid section" });

    // If this section has image fields, check if any were replaced
    const imageFields = IMAGE_FIELDS[section];
    if (imageFields) {
      const existing = await SiteContent.findOne({ section });
      const oldData = existing?.data || {};

      // Delete from Cloudinary if the URL changed and old one exists
      await Promise.all(
        imageFields.map(async (field) => {
          const oldUrl = oldData[field];
          const newUrl = req.body[field];
          if (oldUrl && oldUrl !== newUrl) {
            await deleteFromCloudinary(oldUrl);
            console.log(`🗑️  Cloudinary: removed old ${section}.${field}`);
          }
        })
      );
    }

    const content = await SiteContent.findOneAndUpdate(
      { section },
      { section, data: req.body },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: content.data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;