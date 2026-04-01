"""
OmniShield AI — Python Flask AI Engine
--------------------------------------
Provides perceptual image hashing and similarity comparison.
Uses imagehash library for phash/dhash comparison.
"""

import os
import json
import imagehash
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the Node.js backend

# ──────────────────────────────────────────────
# In-memory store of "known risky" image hashes
# Loaded once at startup from known_hashes.json
# ──────────────────────────────────────────────
KNOWN_HASHES_FILE = os.path.join(os.path.dirname(__file__), "known_hashes.json")

def load_known_hashes():
    """Load pre-computed perceptual hashes from the JSON store."""
    if os.path.exists(KNOWN_HASHES_FILE):
        with open(KNOWN_HASHES_FILE, "r") as f:
            return json.load(f)
    # Default sample hashes if file doesn't exist
    return []

known_hashes = load_known_hashes()

# ──────────────────────────────────────────────
# Similarity scoring
# ──────────────────────────────────────────────
HASH_SIZE = 16           # Larger = more detail, slower
MAX_HAMMING = HASH_SIZE * HASH_SIZE  # Theoretical max distance for phash


def compute_hash(image_path: str) -> imagehash.ImageHash:
    """Compute perceptual hash (pHash) of an image file."""
    img = Image.open(image_path).convert("RGB")
    return imagehash.phash(img, hash_size=HASH_SIZE)


def hamming_to_confidence(distance: int) -> float:
    """
    Convert Hamming distance to a confidence score (0–100%).
    Lower distance = higher confidence of a match.
    """
    max_distance = MAX_HAMMING
    score = max(0.0, 1.0 - (distance / max_distance))
    return round(score * 100, 2)


def compare_against_known(query_hash: imagehash.ImageHash):
    """
    Compare query hash against all known hashes.
    Returns the best match info (lowest Hamming distance).
    """
    if not known_hashes:
        return None, None, 999

    best_match = None
    best_label = "Unknown"
    best_distance = 999

    for entry in known_hashes:
        stored = imagehash.hex_to_hash(entry["hash"])
        distance = query_hash - stored  # Hamming distance
        if distance < best_distance:
            best_distance = distance
            best_match = entry["hash"]
            best_label = entry.get("label", "Unknown Asset")

    return best_label, best_match, best_distance


# ──────────────────────────────────────────────
# API Routes
# ──────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "service": "OmniShield AI Engine", "hashes_loaded": len(known_hashes)})


@app.route("/analyze", methods=["POST"])
def analyze_image():
    """
    POST /analyze
    Accepts a saved image file path (sent by the Node.js backend).
    Returns: hash, confidence, match status, risk label.
    """
    data = request.get_json()
    image_path = data.get("filePath")

    if not image_path or not os.path.exists(image_path):
        return jsonify({"error": "File not found or path not provided"}), 400

    try:
        # Compute perceptual hash of the uploaded image
        query_hash = compute_hash(image_path)

        # Compare against known risky hashes
        label, matched_hash, distance = compare_against_known(query_hash)

        confidence = hamming_to_confidence(distance)

        # Determine match status
        if distance <= 10:
            verdict = "MATCH"
            risk_level = "HIGH"
            message = f"Likely match with known risky asset ({label}). High similarity detected."
        elif distance <= 25:
            verdict = "PARTIAL MATCH"
            risk_level = "MEDIUM"
            message = f"Partial similarity to known asset ({label}). Possible tampering or modification."
        else:
            verdict = "NO MATCH"
            risk_level = "LOW"
            message = "No significant match found with known risky assets. Asset appears safe."

        return jsonify({
            "status": "success",
            "queryHash": str(query_hash),
            "matchedHash": matched_hash,
            "hammingDistance": distance,
            "confidence": confidence,
            "verdict": verdict,
            "riskLevel": risk_level,
            "message": message,
            "label": label
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/register", methods=["POST"])
def register_hash():
    """
    POST /register
    Register a new image hash as a 'known risky' asset.
    Accepts: { filePath, label }
    """
    data = request.get_json()
    image_path = data.get("filePath")
    label = data.get("label", "Unnamed Asset")

    if not image_path or not os.path.exists(image_path):
        return jsonify({"error": "File not found"}), 400

    try:
        new_hash = compute_hash(image_path)
        entry = {"hash": str(new_hash), "label": label}
        known_hashes.append(entry)

        # Persist to file
        with open(KNOWN_HASHES_FILE, "w") as f:
            json.dump(known_hashes, f, indent=2)

        return jsonify({"status": "registered", "hash": str(new_hash), "label": label})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🛡️  OmniShield AI Engine starting on port 5001...")
    app.run(host="0.0.0.0", port=5001, debug=True)
