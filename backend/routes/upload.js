const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../utils/cloudinary");
const auth = require("../middleware/auth");

const router = express.Router();

// ─── Admin image upload (products, categories, content) ───────────────────────
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "carpet-petals",
    // Do NOT restrict dimensions — preserve full HD resolution
    // Cloudinary will serve optimised versions via fetch_format auto
    allowed_formats: ["jpg", "jpeg", "png", "webp", "tiff", "bmp"],
    transformation: [
      // Auto format (webp for browsers that support it) + auto quality
      // This keeps visual quality high while reducing file size on delivery
      { fetch_format: "auto", quality: "auto:best" },
    ],
    // Use original filename slugified as public_id for readability
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  }),
});

const imageFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/tiff",
    "image/bmp",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPG, PNG, WEBP, TIFF, BMP)"), false);
  }
};

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 80 * 1024 * 1024, // 80MB — covers RAW exports and HD TIFFs
  },
});

router.post("/", auth, (req, res) => {
  imageUpload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File too large. Maximum size is 80MB." });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      console.error("Upload error:", err.message);
      return res.status(400).json({ success: false, message: err.message || "Upload failed" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file received" });
    }
    console.log("Uploaded to Cloudinary:", req.file.path);
    res.json({ success: true, data: { url: req.file.path } });
  });
});

// ─── Public attachment upload (contact form — images + PDFs) ─────────────────
const attachmentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === "application/pdf";
    return {
      folder: "carpet-petals/attachments",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
      resource_type: isPdf ? "raw" : "image",
      ...(!isPdf && {
        transformation: [{ fetch_format: "auto", quality: "auto:best" }],
      }),
      use_filename: true,
      unique_filename: true,
    };
  },
});

const attachmentFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF files are allowed"), false);
  }
};

const attachmentUpload = multer({
  storage: attachmentStorage,
  fileFilter: attachmentFilter,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB for attachments
  },
});

router.post("/attachment", (req, res) => {
  attachmentUpload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File too large. Maximum attachment size is 30MB." });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message || "Upload failed" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file received" });
    }
    res.json({ success: true, data: { url: req.file.path } });
  });
});

module.exports = router;