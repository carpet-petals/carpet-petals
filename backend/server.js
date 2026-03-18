const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://carpetpetals.vercel.app",   
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ Blocked by CORS:", origin);
      callback(new Error(`CORS policy: Origin '${origin}' not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, 
};

app.use(cors(corsOptions));

app.options(/(.*)/, cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth",       require("./routes/auth"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/products",   require("./routes/products"));
app.use("/api/content",    require("./routes/content"));
app.use("/api/contact",    require("./routes/contact"));
app.use("/api/upload",     require("./routes/upload"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});


app.get("/api/cloudinary-test", async (req, res) => {
  try {
    const cloudinary = require("cloudinary").v2;
    const result = await cloudinary.api.ping();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found`,
  });
});


app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith("CORS policy")) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  console.error("❌ Server Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message,
  });
});


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Allowed origins: ${allowedOrigins.join(", ")}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });