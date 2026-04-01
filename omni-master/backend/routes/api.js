/**
 * OmniShield AI — API Routes
 * --------------------------
 * Defines Express routes for:
 *  - POST /api/upload     → Image fingerprint analysis
 *  - GET  /api/heatmap    → Risk heatmap data
 *  - GET  /api/risk       → Current risk snapshot
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const aiController = require("../controllers/aiController");
const heatmapData = require("../data/dummyData.json");

// ──────────────────────────────────────────────
// Multer — file upload config
// ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|bmp|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ──────────────────────────────────────────────
// POST /api/upload — Analyze uploaded image
// ──────────────────────────────────────────────
router.post("/upload", upload.single("image"), aiController.analyzeImage);

// ──────────────────────────────────────────────
// GET /api/heatmap — Return heatmap JSON dataset
// ──────────────────────────────────────────────
router.get("/heatmap", (req, res) => {
  res.json({ status: "success", data: heatmapData });
});

// ──────────────────────────────────────────────
// GET /api/risk — Return a current risk snapshot
// ──────────────────────────────────────────────
router.get("/risk", (req, res) => {
  const score = Math.floor(Math.random() * 100);
  let status, message;

  if (score < 35) {
    status = "SAFE";
    message = "All systems operating normally.";
  } else if (score < 70) {
    status = "WARNING";
    message = "Elevated activity detected. Monitoring in progress.";
  } else {
    status = "DANGER";
    message = "High-risk event detected! Immediate attention required.";
  }

  res.json({
    score,
    status,
    message,
    confidence: Math.floor(60 + Math.random() * 40),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
