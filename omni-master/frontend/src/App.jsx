/**
 * OmniShield AI — Main Application
 * ----------------------------------
 * Establishes Socket.io connection for real-time risk updates.
 * Renders the full dashboard layout:
 *   - Header / Nav
 *   - Stats strip
 *   - Live Risk Score + Alert Feed (left column)
 *   - Heatmap (center/right, full width)
 *   - Upload Panel
 */

import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Shield, Activity, Wifi, WifiOff } from "lucide-react";

import RiskScore   from "./components/RiskScore";
import AlertFeed   from "./components/AlertFeed";
import Heatmap     from "./components/Heatmap";
import UploadPanel from "./components/UploadPanel";
import StatsBar    from "./components/StatsBar";

const SOCKET_URL   = "http://localhost:4000";
const MAX_ALERTS   = 10;

export default function App() {
  const [connected,  setConnected]  = useState(false);
  const [riskData,   setRiskData]   = useState({ score: 0, status: "SAFE", message: "Connecting…", confidence: 0 });
  const [alerts,     setAlerts]     = useState([]);

  // ── Socket.io ──────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });

    socket.on("connect",    () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("riskUpdate", (data) => {
      setRiskData(data);
      setAlerts((prev) => [data, ...prev].slice(0, MAX_ALERTS));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="min-h-screen grid-bg text-slate-200" style={{ backgroundColor: "var(--color-bg)" }}>

      {/* ── Header ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-surface-900/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center glow-brand">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold gradient-text leading-none">OmniShield AI</h1>
              <p className="text-xs text-slate-500 leading-none mt-0.5">Risk Intelligence Platform</p>
            </div>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
              connected
                ? "text-safe-400 border-safe-500/30 bg-safe-500/5"
                : "text-danger-400 border-danger-500/30 bg-danger-500/5"
            }`}>
              {connected
                ? <><Wifi size={12} /> Live</>
                : <><WifiOff size={12} /> Disconnected</>
              }
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Activity size={12} className="text-brand-400" />
              <span className="font-mono">
                {new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────── */}
      <main className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">

        {/* Stats bar */}
        <StatsBar score={riskData.score} alerts={alerts} />

        {/* Row 1: Risk Score + Alert Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RiskScore
              score={riskData.score}
              confidence={riskData.confidence}
              message={riskData.message}
            />
          </div>
          <div className="lg:col-span-2">
            <AlertFeed alerts={alerts} />
          </div>
        </div>

        {/* Row 2: Heatmap — full width */}
        <Heatmap />

        {/* Row 3: Digital Fingerprint Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UploadPanel />

          {/* Info card */}
          <div className="glass-card p-6 flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                How It Works
              </span>
            </div>

            {[
              {
                step: "01",
                title: "Upload Image",
                body: "Drag & drop any image. Our system accepts JPEG, PNG, WebP formats up to 10 MB.",
              },
              {
                step: "02",
                title: "Perceptual Hashing",
                body: "The Python AI engine (pHash) generates a compact fingerprint from pixel structure — resistant to minor modifications.",
              },
              {
                step: "03",
                title: "Hash Comparison",
                body: "The fingerprint is compared using Hamming distance against a database of known risky assets.",
              },
              {
                step: "04",
                title: "Confidence Score",
                body: "Instead of binary output, you receive a confidence percentage and \"likely risk\" verdict for nuanced decision-making.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-brand-400 font-mono">{step}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="border-t border-white/5 mt-12 py-6 text-center text-xs text-slate-600">
        <Shield size={12} className="inline mr-1 text-brand-500" />
        OmniShield AI — Hackathon Prototype · Built with React, Node.js &amp; Python Flask
      </footer>
    </div>
  );
}
