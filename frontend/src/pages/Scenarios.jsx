// src/pages/Scenarios.jsx
import React, { useState } from "react";
import { api } from "../lib/api";

const PRESET_SCENARIOS = [
  { icon: "💰", label: "Narxni 20% oshirsam", scenario: "Agar mahsulot va xizmat narxlarini 20% oshirsam nima bo'ladi?" },
  { icon: "👥", label: "2 yangi xodim olsam", scenario: "Agar 2 ta yangi xodim yollasam (ish haqi oyiga 2,500,000 so'm) nima bo'ladi?" },
  { icon: "🏪", label: "Ikkinchi filial ochsam", scenario: "Agar Chilonzorda ikkinchi filial ochsam (ijara 8 mln/oy) nima bo'ladi?" },
  { icon: "📢", label: "Marketing budjeti 2x", scenario: "Agar marketing xarajatlarini ikki barobarga oshirsam (hozir 800K → 1.6 mln) savdo oshadimi?" },
  { icon: "🔄", label: "Kredit olsam (50 mln)", scenario: "Agar bankdan 50 mln so'm kredit olsam (18% yillik) va jihoz sotib olsam foydali bo'ladimi?" },
  { icon: "📉", label: "Mavsumiy tushish", scenario: "Yozgi mavsumda daromad 30% tushsa qanday chora ko'rishim kerak?" },
];

export default function Scenarios({ apiKeySet }) {
  const [selected, setSelected] = useState(null);
  const [customScenario, setCustomScenario] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function analyze(scenarioText) {
    if (!apiKeySet) {
      setError("AI funksiyasi uchun Gemini API kaliti kerak. 'AI Maslahat' sahifasidan kiriting.");
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await api.scenario(scenarioText);
      setResult(res.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 className="heading-xl" style={{ marginBottom: 6 }}>Stsenariy Tahlili ◎</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          "Agar ... qilsam nima bo'ladi?" — AI bilan moliyaviy prognoz
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Left: scenario selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Preset scenarios */}
          <div className="card fade-up-1">
            <div className="heading-md" style={{ marginBottom: 14 }}>Tayyor stsenariylar</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PRESET_SCENARIOS.map(s => (
                <button key={s.label}
                  onClick={() => { setSelected(s); setCustomScenario(""); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px",
                    background: selected?.label === s.label ? "var(--accent-dim)" : "var(--bg-elevated)",
                    border: `1px solid ${selected?.label === s.label ? "var(--accent)" : "var(--border-default)"}`,
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textAlign: "left",
                    color: selected?.label === s.label ? "var(--accent)" : "var(--text-secondary)",
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                  }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <span>{s.label}</span>
                  {selected?.label === s.label && <span style={{ marginLeft: "auto" }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Custom scenario */}
          <div className="card fade-up-2">
            <div className="heading-md" style={{ marginBottom: 12 }}>O'z stsenariyingizni yozing</div>
            <textarea
              className="input"
              value={customScenario}
              onChange={e => { setCustomScenario(e.target.value); setSelected(null); }}
              placeholder="Masalan: Agar yetkazib berish xizmatini qo'shsam va 3 ta haydovchi yollasam..."
              rows={4}
              style={{ resize: "vertical", lineHeight: 1.5 }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={() => analyze(selected?.scenario || customScenario)}
            disabled={loading || (!selected && !customScenario.trim())}
            style={{ opacity: loading ? 0.7 : 1, justifyContent: "center" }}
          >
            {loading ? (
              <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Tahlil qilinmoqda...</>
            ) : (
              "✦ AI Tahlil Qilsin →"
            )}
          </button>
        </div>

        {/* Right: result */}
        <div>
          {error && (
            <div className="card fade-up" style={{
              background: "var(--red-dim)", border: "1px solid rgba(255,77,106,0.3)"
            }}>
              <div style={{ display: "flex", gap: 10 }}>
                <span>⚠️</span>
                <div style={{ color: "var(--text-primary)", fontSize: 14 }}>{error}</div>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="card fade-up" style={{
              height: "100%", minHeight: 300,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: "var(--bg-elevated)",
              border: "1px dashed var(--border-default)",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>◎</div>
              <div className="heading-md" style={{ color: "var(--text-muted)", marginBottom: 8 }}>
                Stsenariy tanlang
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", maxWidth: 250 }}>
                Chap tarafdan stsenariy tanlang yoki o'zingizning savolingizni yozing
              </div>
            </div>
          )}

          {loading && (
            <div className="card" style={{
              height: "100%", minHeight: 300,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                border: "3px solid var(--border-default)",
                borderTopColor: "var(--accent)",
                animation: "spin 1s linear infinite",
                marginBottom: 16,
              }} />
              <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>AI tahlil qilmoqda...</div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 6 }}>
                Biznes ma'lumotlari bilan solishtirmoqda
              </div>
            </div>
          )}

          {result && (
            <div className="card fade-up" style={{ height: "100%" }}>
              <div style={{
                display: "flex", gap: 8, alignItems: "center", marginBottom: 16,
                paddingBottom: 16, borderBottom: "1px solid var(--border-subtle)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "linear-gradient(135deg, var(--accent) 0%, #00a8ff 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "#000",
                }}>N</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>NEX AI Tahlili</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Gemini 1.5 Flash</div>
                </div>
                <span className="badge badge-accent" style={{ marginLeft: "auto" }}>✦ Tayyor</span>
              </div>
              <div style={{
                fontSize: 14, lineHeight: 1.75, color: "var(--text-secondary)",
                whiteSpace: "pre-wrap", overflowY: "auto", maxHeight: 500,
              }}>
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
