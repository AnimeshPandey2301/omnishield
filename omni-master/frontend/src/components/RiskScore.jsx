/**
 * RiskScore — Animated circular gauge showing risk score 0-100.
 * Color transitions: green (safe) → yellow (warning) → red (danger)
 */
import React, { useEffect, useRef } from "react";

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getColor(score) {
  if (score < 35) return "#10b981"; // safe green
  if (score < 70) return "#f59e0b"; // warning amber
  return "#ef4444"; // danger red
}

function getStatus(score) {
  if (score < 35) return { label: "SAFE",    cls: "badge-safe"    };
  if (score < 70) return { label: "WARNING", cls: "badge-warning" };
  return              { label: "DANGER",  cls: "badge-danger"  };
}

export default function RiskScore({ score = 0, confidence = 0, message = "" }) {
  const color = getColor(score);
  const { label, cls } = getStatus(score);
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  const glowClass =
    score < 35 ? "glow-safe" : score < 70 ? "glow-warning" : "glow-danger";

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 self-start">
        <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Live Risk Score
        </span>
      </div>

      {/* SVG Gauge */}
      <div className={`score-ring ${glowClass} rounded-full p-1`}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          {/* Background track */}
          <circle
            cx="70" cy="70" r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
          />
          {/* Score arc */}
          <circle
            cx="70" cy="70" r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
          />
          {/* Score text */}
          <text
            x="70" y="65"
            textAnchor="middle"
            fill="white"
            fontSize="26"
            fontWeight="800"
            fontFamily="Inter, sans-serif"
          >
            {score}
          </text>
          <text
            x="70" y="85"
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="11"
            fontFamily="Inter, sans-serif"
          >
            / 100
          </text>
        </svg>
      </div>

      {/* Status badge */}
      <span className={`badge ${cls} text-sm`}>
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        {label}
      </span>

      {/* Confidence */}
      <div className="w-full">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Confidence</span>
          <span className="font-mono text-slate-300">{confidence}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{
              width: `${confidence}%`,
              background: `linear-gradient(90deg, ${color}99, ${color})`,
            }}
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <p className="text-xs text-slate-400 text-center leading-relaxed border-t border-white/5 pt-4 w-full">
          {message}
        </p>
      )}
    </div>
  );
}
