/**
 * OmniShield AI — Node.js / Express Backend
 * -----------------------------------------
 * Main server entry point. Wires up Express, Socket.io,
 * Multer, CORS and delegates routes to /routes/api.js
 */

const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");

const apiRoutes = require("./routes/api");

const app = express();
const server = http.createServer(app);

// ──────────────────────────────────────────────
// Socket.io — real-time risk score broadcasting
// ──────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Make io accessible inside routes
app.set("io", io);

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (for preview)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({ message: "🛡️ OmniShield AI Backend is running!" });
});

// ──────────────────────────────────────────────
// Socket.io — simulate live risk score updates
// ──────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // Send an initial risk score immediately
  socket.emit("riskUpdate", generateRiskPayload());

  // Broadcast updated scores every 5 seconds
  const interval = setInterval(() => {
    const payload = generateRiskPayload();
    io.emit("riskUpdate", payload);
  }, 5000);

  socket.on("disconnect", () => {
    clearInterval(interval);
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

/**
 * Generates a simulated risk score payload using a formula-based approach.
 * In a real system this would query live data sources.
 */
function generateRiskPayload() {
  const score = Math.floor(Math.random() * 100);
  let status, message;

  if (score < 35) {
    status = "SAFE";
    message = "All systems operating normally. No threats detected.";
  } else if (score < 70) {
    status = "WARNING";
    message = "Elevated activity detected. Monitoring in progress.";
  } else {
    status = "DANGER";
    message = "High-risk event detected! Immediate attention required.";
  }

  return {
    score,
    status,
    message,
    timestamp: new Date().toISOString(),
    confidence: Math.floor(60 + Math.random() * 40), // 60–100%
  };
}

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 OmniShield Backend running at http://localhost:${PORT}`);
});
