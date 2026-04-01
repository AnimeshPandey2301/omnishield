/**
 * Heatmap — Interactive Leaflet world map with risk location markers.
 * Supports Day/Night tile switching.
 */
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Sun, Moon } from "lucide-react";
import apiClient from "../api/axiosClient";

// ─── Tile layers ───
const TILES = {
  night: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
  day: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
  },
};

// ─── Risk colors ───
const RISK_COLORS = {
  HIGH:   { fill: "#ef4444", stroke: "#dc2626" },
  MEDIUM: { fill: "#f59e0b", stroke: "#d97706" },
  LOW:    { fill: "#10b981", stroke: "#059669" },
};

function getRiskStyle(risk) {
  return RISK_COLORS[risk] || RISK_COLORS.LOW;
}

function getRadius(score) {
  return 8 + (score / 100) * 16;
}

export default function Heatmap() {
  const [locations, setLocations] = useState([]);
  const [mode, setMode]           = useState("night"); // "night" | "day"
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    apiClient
      .get("/heatmap")
      .then((res) => setLocations(res.data.data || []))
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, []);

  const tile = TILES[mode];

  return (
    <div className="glass-card p-5 flex flex-col gap-4 animate-fade-in h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Global Risk Heatmap
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          {Object.entries(RISK_COLORS).map(([level, { fill }]) => (
            <span key={level} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: fill }} />
              {level}
            </span>
          ))}
        </div>

        {/* Day/Night toggle */}
        <button
          id="map-mode-toggle"
          onClick={() => setMode((m) => (m === "night" ? "day" : "night"))}
          className="btn btn-primary text-xs gap-1.5"
        >
          {mode === "night" ? (
            <><Sun size={13} /> Day Mode</>
          ) : (
            <><Moon size={13} /> Night Mode</>
          )}
        </button>
      </div>

      {/* Map */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
          Loading map data...
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ height: "420px" }}>
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer url={tile.url} attribution={tile.attribution} />

            {locations.map((loc) => {
              const { fill, stroke } = getRiskStyle(loc.risk);
              const radius = getRadius(loc.score);
              return (
                <CircleMarker
                  key={loc.id}
                  center={[loc.lat, loc.lng]}
                  radius={radius}
                  pathOptions={{
                    fillColor: fill,
                    fillOpacity: 0.75,
                    color: stroke,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div style={{ fontFamily: "Inter, sans-serif", minWidth: 160 }}>
                      <strong style={{ fontSize: 14 }}>{loc.city}, {loc.country}</strong>
                      <table style={{ width: "100%", fontSize: 11, marginTop: 6, borderCollapse: "collapse" }}>
                        <tbody>
                          <tr><td style={{ color: "#888", paddingRight: 8 }}>Risk Level</td><td><strong style={{ color: fill }}>{loc.risk}</strong></td></tr>
                          <tr><td style={{ color: "#888" }}>Score</td><td><strong>{loc.score}/100</strong></td></tr>
                          <tr><td style={{ color: "#888" }}>Incidents</td><td>{loc.incidents}</td></tr>
                          <tr><td style={{ color: "#888" }}>Category</td><td>{loc.category}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      )}

      <p className="text-xs text-slate-600 text-right">
        Showing {locations.length} risk locations · Click markers for details
      </p>
    </div>
  );
}
