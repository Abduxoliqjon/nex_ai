// src/components/layout/Sidebar.jsx
import React from "react";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "analytics", label: "Tahlil", icon: "◈" },
  { id: "forecast", label: "Bashorat", icon: "◇" },
  { id: "advisor", label: "AI Maslahat", icon: "✦" },
  { id: "reviews", label: "Sharhlar", icon: "★" },
  { id: "scenarios", label: "Stsenariy", icon: "◎" },
  { id: "transactions", label: "Tranzaksiyalar", icon: "≡" },
];

export default function Sidebar({ activePage, onNavigate, apiKeySet }) {
  return (
    <aside style={{
      position: "fixed",
      left: 0, top: 0, bottom: 0,
      width: "var(--sidebar-w)",
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border-default)",
      display: "flex",
      flexDirection: "column",
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, var(--accent) 0%, #00a8ff 100%)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 16,
            color: "#000",
            letterSpacing: "-0.04em",
            flexShrink: 0,
          }}>N</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>NEX</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>AI MOLIYA</div>
          </div>
        </div>
      </div>

      {/* Business info */}
      <div style={{ padding: "16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-md)",
          padding: "12px 14px",
          border: "1px solid var(--border-default)",
        }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-mono)" }}>DEMO BIZNES</div>
          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>Milliy Taomlar</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>🍽️ Restoran · Toshkent</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        {NAV.map(item => {
          const active = activePage === item.id;
          return (
            <button key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 14px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: active ? "var(--accent-dim)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                marginBottom: 2,
                transition: "all 0.15s",
                textAlign: "left",
                position: "relative",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              {active && (
                <div style={{
                  position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                  width: 3, height: 16, background: "var(--accent)", borderRadius: "0 2px 2px 0",
                }} />
              )}
              <span style={{ fontSize: 14, opacity: active ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* API Status */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 12px",
          background: apiKeySet ? "var(--green-dim)" : "var(--yellow-dim)",
          borderRadius: "var(--radius-sm)",
          border: `1px solid ${apiKeySet ? "rgba(34,217,142,0.2)" : "rgba(255,209,102,0.2)"}`,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: apiKeySet ? "var(--green)" : "var(--yellow)",
          }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: apiKeySet ? "var(--green)" : "var(--yellow)", fontFamily: "var(--font-mono)" }}>
              {apiKeySet ? "AI ULANGAN" : "API KERAK"}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>Gemini 1.5 Flash</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
