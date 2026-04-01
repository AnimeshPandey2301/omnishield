/**
 * OmniShield AI — AI Controller
 * --------------------------------
 * Proxies requests from Express to the Python Flask AI Engine.
 * The Flask service runs on port 5001.
 */

const axios = require("axios");
const path = require("path");

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:5001";

/**
 * POST /api/upload
 * Receives an uploaded file from Multer, forwards its path to
 * the Python Flask service, and returns the AI analysis result.
 */
async function analyzeImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No image file uploaded." });
  }

  const filePath = path.resolve(req.file.path);

  try {
    // Forward the absolute file path to the Python Flask service
    const aiResponse = await axios.post(`${AI_ENGINE_URL}/analyze`, {
      filePath,
    });

    const aiData = aiResponse.data;

    // Enrich the response with additional metadata
    return res.json({
      status: "success",
      filename: req.file.originalname,
      uploadedAs: req.file.filename,
      analysis: {
        queryHash: aiData.queryHash,
        matchedHash: aiData.matchedHash,
        verdict: aiData.verdict,
        riskLevel: aiData.riskLevel,
        confidence: aiData.confidence,
        message: aiData.message,
        label: aiData.label,
        hammingDistance: aiData.hammingDistance,
      },
    });
  } catch (err) {
    // If the AI engine is unavailable, return a graceful fallback
    console.error("AI Engine error:", err.message);

    // Graceful fallback — simulate a response for demo purposes
    const mockScore = Math.floor(Math.random() * 100);
    const mockVerdict = mockScore > 70 ? "MATCH" : mockScore > 40 ? "PARTIAL MATCH" : "NO MATCH";
    const mockRisk = mockScore > 70 ? "HIGH" : mockScore > 40 ? "MEDIUM" : "LOW";

    return res.json({
      status: "success (fallback mode)",
      filename: req.file.originalname,
      uploadedAs: req.file.filename,
      warning: "AI Engine offline — using simulation mode",
      analysis: {
        queryHash: "simulation_mode",
        matchedHash: null,
        verdict: mockVerdict,
        riskLevel: mockRisk,
        confidence: mockScore + Math.floor(Math.random() * 20),
        message: `Simulation: ${mockVerdict}. Risk assessed as ${mockRisk}.`,
        label: "Simulated Result",
        hammingDistance: null,
      },
    });
  }
}

module.exports = { analyzeImage };
