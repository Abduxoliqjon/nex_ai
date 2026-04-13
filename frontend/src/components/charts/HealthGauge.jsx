// src/components/charts/HealthGauge.jsx
import React from "react";

export default function HealthGauge({ score = 0, breakdown = {}, status = "warning" }) {
  const size = 180;
  const strokeWidth = 14;
  const r = (size / 2) - strokeWidth;
  const cx = size / 2;
  const cy = size / 2;

  // Half-circle arc
  const startAngle = 180;
  const endAngle = 0;
  const totalAngle = 180;
  const scoreAngle = (score / 100) * totalAngle;

  function polarToCartesian(angle) {
    const rad = ((angle - 180) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function describeArc(startDeg, endDeg) {
    const start = polarToCartesian(startDeg);
    const end = polarToCartesian(endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
  }

  const colors = { healthy: "#22d98e", warning: "#ffd166", critical: "#ff4d6a" };
  const labels = { healthy: "SALOMAT", warning: "DIQQAT", critical: "XAVFLI" };
  const scoreColor = colors[status] || colors.warning;

  const needleAngle = scoreAngle; // 0-180
  const needleRad = ((needleAngle - 90) * Math.PI) / 180;
  const needleLen = r - 8;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={describeArc(0, 180)}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Score arc */}
        {score > 0 && (
          <path
            d={describeArc(0, scoreAngle)}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${scoreColor}50)` }}
          />
        )}
        {/* Tick marks */}
        {[0, 40, 70, 100].map((val, i) => {
          const angle = (val / 100) * 180;
          const inner = r - strokeWidth / 2 - 2;
          const outer = r + strokeWidth / 2 + 2;
          const rad = ((angle - 90) * Math.PI) / 180;
          return (
            <line key={i}
              x1={cx + inner * Math.cos(rad)} y1={cy + inner * Math.sin(rad)}
              x2={cx + outer * Math.cos(rad)} y2={cy + outer * Math.sin(rad)}
              stroke="var(--bg-base)" strokeWidth={2}
            />
          );
        })}
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={nx} y2={ny}
          stroke="var(--text-primary)"
          strokeWidth={2}
          strokeLinecap="round"
          style={{ opacity: 0.6 }}
        />
        <circle cx={cx} cy={cy} r={5} fill={scoreColor} />
        {/* Center score */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill={scoreColor}
          style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700 }}>
          {score}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill={scoreColor}
          style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em" }}>
          {labels[status]}
        </text>
      </svg>

      {/* Breakdown bars */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
        {Object.entries({
          "Pul oqimi": breakdown.cashflow || 0,
          "O'sish": breakdown.growth || 0,
          "Xarajat nisbati": breakdown.expenseRatio || 0,
          "Barqarorlik": breakdown.regularity || 0,
        }).map(([label, val]) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: scoreColor }}>{val}/25</span>
            </div>
            <div style={{ height: 3, background: "var(--bg-elevated)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(val / 25) * 100}%`,
                background: scoreColor,
                borderRadius: 2,
                transition: "width 0.8s ease",
                opacity: 0.8,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
