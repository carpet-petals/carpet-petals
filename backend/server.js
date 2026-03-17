const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/products", require("./routes/products"));
app.use("/api/content", require("./routes/content"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/upload", require("./routes/upload"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Cloudinary test
app.get("/api/cloudinary-test", async (req, res) => {
  try {
    const cloudinary = require("cloudinary").v2;
    const result = await cloudinary.api.ping();
    res.json({ success: true, result });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// MongoDB connection + server start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
