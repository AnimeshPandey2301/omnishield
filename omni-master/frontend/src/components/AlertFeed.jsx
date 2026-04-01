/**
 * AlertFeed — Scrollable list of live risk alerts with timestamps.
 * Shows up to the last 10 alerts, newest first.
 */
import React from "react";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

function AlertIcon({ status }) {
  if (status === "SAFE")    return <CheckCircle  size={16} className="text-safe-400 shrink-0"    />;
  if (status === "WARNING") return <AlertTriangle size={16} className="text-warning-400 shrink-0" />;
  if (status === "DANGER")  return <XCircle      size={16} className="text-danger-400 shrink-0"  />;
  return                           <Info          size={16} className="text-brand-400 shrink-0"   />;
}

function alertBg(status) {
  if (status === "SAFE")    return "bg-safe-500/5    border-safe-500/20";
  if (status === "WARNING") return "bg-warning-500/5 border-warning-500/20";
  if (status === "DANGER")  return "bg-danger-500/5  border-danger-500/20 alert-flash";
  return "bg-brand-500/5 border-brand-500/20";
}

export default function AlertFeed({ alerts = [] }) {
  return (
    <div className="glass-card p-5 flex flex-col gap-4 h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-danger-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Live Alerts
          </span>
        </div>
        <span className="badge badge-info">{alerts.length} events</span>
      </div>

      {/* Alert list */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-64 pr-1">
        {alerts.length === 0 ? (
          <div className="text-center text-slate-600 text-sm py-8">
            Awaiting connection...
          </div>
        ) : (
          alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-xl border text-sm transition-all duration-300 ${alertBg(alert.status)}`}
            >
              <AlertIcon status={alert.status} />
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 leading-snug truncate">{alert.message}</p>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  {new Date(alert.timestamp).toLocaleTimeString()} · Score: {alert.score}
                </p>
              </div>
              <span
                className={`badge shrink-0 text-xs ${
                  alert.status === "SAFE" ? "badge-safe" :
                  alert.status === "WARNING" ? "badge-warning" : "badge-danger"
                }`}
              >
                {alert.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
