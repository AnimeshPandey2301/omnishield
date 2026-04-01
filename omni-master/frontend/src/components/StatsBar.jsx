/**
 * StatsBar — Top summary stats strip showing threat counts.
 */
import React from "react";
import { ShieldAlert, Activity, Globe, Cpu } from "lucide-react";

export default function StatsBar({ score = 0, alerts = [] }) {
  const danger  = alerts.filter((a) => a.status === "DANGER").length;
  const warning = alerts.filter((a) => a.status === "WARNING").length;
  const safe    = alerts.filter((a) => a.status === "SAFE").length;

  const stats = [
    { icon: ShieldAlert, label: "Threats",   value: danger,         color: "text-danger-400"  },
    { icon: Activity,    label: "Warnings",   value: warning,        color: "text-warning-400" },
    { icon: Globe,       label: "Locations",  value: 30,             color: "text-brand-400"   },
    { icon: Cpu,         label: "Risk Score", value: `${score}/100`, color: "text-slate-200"   },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <div
          key={label}
          className="glass-card p-4 flex items-center gap-3 animate-fade-in"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
            <Icon size={18} className={color} />
          </div>
          <div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
