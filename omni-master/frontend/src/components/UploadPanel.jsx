/**
 * UploadPanel — Drag-and-drop image upload for digital fingerprint analysis.
 * Sends the image to the backend and renders confidence-based AI results.
 */
import React, { useState, useRef } from "react";
import { Upload, FileImage, Loader2, ShieldCheck, ShieldAlert, ShieldX, X } from "lucide-react";
import apiClient from "../api/axiosClient";

function VerdictIcon({ verdict }) {
  if (!verdict) return null;
  if (verdict === "NO MATCH")      return <ShieldCheck  size={32} className="text-safe-400"    />;
  if (verdict === "PARTIAL MATCH") return <ShieldAlert  size={32} className="text-warning-400" />;
  return                                   <ShieldX     size={32} className="text-danger-400"  />;
}

function riskBadgeCls(risk) {
  if (risk === "LOW")    return "badge-safe";
  if (risk === "MEDIUM") return "badge-warning";
  return "badge-danger";
}

function ConfidenceBar({ value, riskLevel }) {
  const color =
    riskLevel === "LOW" ? "#10b981" :
    riskLevel === "MEDIUM" ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400">
        <span>Confidence</span>
        <span className="font-mono font-semibold text-slate-200">{value}%</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
    </div>
  );
}

export default function UploadPanel() {
  const [dragging, setDragging]   = useState(false);
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);
  const inputRef                  = useRef();

  function handleFile(f) {
    if (!f || !f.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setError("Analysis failed. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  }

  const analysis = result?.analysis;

  return (
    <div className="glass-card p-6 flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Digital Fingerprint Scanner
        </span>
      </div>

      {/* Dropzone */}
      {!file ? (
        <div
          id="image-dropzone"
          className={`dropzone flex flex-col items-center justify-center gap-3 py-12 px-6 text-center ${dragging ? "active" : ""}`}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <Upload size={24} className="text-brand-400" />
          </div>
          <div>
            <p className="text-slate-300 font-semibold">Drop image here or click to upload</p>
            <p className="text-slate-500 text-xs mt-1">JPEG, PNG, WebP up to 10 MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* File preview */}
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/20">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-danger-600/60 transition-colors"
            >
              <X size={14} className="text-white" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-xs text-slate-300 font-mono truncate">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>

          {/* Analyze button */}
          {!result && (
            <button
              id="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading}
              className="btn btn-primary w-full justify-center"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
              ) : (
                <><FileImage size={16} /> Analyze Fingerprint</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-danger-400 bg-danger-500/10 border border-danger-500/20 rounded-lg p-3">
          <ShieldX size={14} />
          {error}
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-4 border-t border-white/5 pt-4 animate-slide-up">
          {/* Verdict header */}
          <div className="flex items-center gap-3">
            <VerdictIcon verdict={analysis.verdict} />
            <div>
              <p className="font-bold text-white text-lg leading-tight">{analysis.verdict}</p>
              <span className={`badge ${riskBadgeCls(analysis.riskLevel)}`}>
                {analysis.riskLevel} RISK
              </span>
            </div>
          </div>

          {/* Confidence bar */}
          <ConfidenceBar value={analysis.confidence} riskLevel={analysis.riskLevel} />

          {/* Message */}
          <p className="text-sm text-slate-400 leading-relaxed">{analysis.message}</p>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Matched Asset",    value: analysis.label },
              { label: "Hamming Distance", value: analysis.hammingDistance ?? "N/A" },
              { label: "Query Hash",       value: analysis.queryHash?.slice(0, 16) + "…" },
              { label: "Simulation",       value: result.warning ? "Yes" : "No" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/3 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-xs text-slate-200 font-mono truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Reset */}
          <button onClick={handleReset} className="btn w-full justify-center text-slate-400 border border-white/10 hover:border-brand-500/40 bg-transparent">
            Scan Another Image
          </button>
        </div>
      )}
    </div>
  );
}
