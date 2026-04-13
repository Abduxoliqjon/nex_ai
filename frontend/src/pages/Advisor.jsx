// src/pages/Advisor.jsx
import React, { useState, useRef, useEffect } from "react";
import { api } from "../lib/api";

const SUGGESTIONS = [
  "Biznesim kengayishga tayyormi?",
  "Bu oy xarajatim nima uchun oshdi?",
  "Kredit olsam foydali bo'ladimi?",
  "Kelgusi 3 oyda daromadim qancha bo'ladi?",
  "Biznesimning eng zaif tomoni nima?",
  "Yangi xodim olsam foydalimi?",
];

function Message({ msg }) {
  const isAI = msg.role === "assistant";
  return (
    <div style={{
      display: "flex",
      gap: 12,
      justifyContent: isAI ? "flex-start" : "flex-end",
      marginBottom: 16,
      animation: "fadeUp 0.3s ease",
    }}>
      {isAI && (
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: "linear-gradient(135deg, var(--accent) 0%, #00a8ff 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "#000",
        }}>N</div>
      )}
      <div style={{
        maxWidth: "72%",
        padding: "12px 16px",
        borderRadius: isAI ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
        background: isAI ? "var(--bg-elevated)" : "var(--accent)",
        border: isAI ? "1px solid var(--border-default)" : "none",
        color: isAI ? "var(--text-primary)" : "#000",
        fontSize: 13.5,
        lineHeight: 1.65,
        whiteSpace: "pre-wrap",
      }}>
        {msg.content}
        {msg.loading && (
          <span style={{ display: "inline-flex", gap: 3, marginLeft: 4, alignItems: "center" }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "var(--text-muted)",
                animation: `pulse-ring 1.2s ${i * 0.2}s infinite`,
              }} />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Advisor({ apiKeySet, onSetApiKey }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Salom! Men NEX — sizning AI moliyaviy maslahatchiingizman. 🎯\n\nMilliy Taomlar restoraning moliyaviy ma'lumotlari bilan tanishdim. Daromad, xarajat, o'sish tendensiyasi — hammasini ko'rdim.\n\nQanday savol bor?",
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiInput, setShowApiInput] = useState(!apiKeySet);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setShowApiInput(!apiKeySet);
  }, [apiKeySet]);

  async function handleSend(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    setMessages(prev => [...prev, { role: "assistant", content: "", loading: true }]);

    try {
      const res = await api.chat(msg);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: res.reply };
        return updated;
      });
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `❌ ${err.message}`
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSetKey() {
    if (!apiKey.trim()) return;
    try {
      await onSetApiKey(apiKey.trim());
      setShowApiInput(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "✅ Gemini API muvaffaqiyatli ulandi! Endi menga istalgan moliyaviy savol bering — to'liq tahlil qilib javob beraman."
      }]);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="page" style={{ height: "calc(100vh - 0px)", display: "flex", flexDirection: "column", paddingBottom: 0 }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="heading-xl">AI Maslahat ✦</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            Gemini 1.5 Flash • Biznes ma'lumotlaringizga asoslangan maslahat
          </p>
        </div>
        {apiKeySet ? (
          <div className="badge badge-green">● AI ULANGAN</div>
        ) : (
          <div className="badge badge-yellow">● API KERAK</div>
        )}
      </div>

      {/* API Key setup */}
      {showApiInput && (
        <div className="card fade-up-1" style={{
          marginBottom: 16,
          background: "var(--yellow-dim)",
          border: "1px solid rgba(255,209,102,0.25)",
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20 }}>🔑</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>Gemini API Kaliti Kiriting</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                AI maslahat funksiyasi uchun Gemini API kaliti kerak.{" "}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                  style={{ color: "var(--accent)" }}>Bu yerdan oling →</a>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  className="input"
                  type="password"
                  placeholder="AIza..."
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSetKey()}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" onClick={handleSetKey}>Ulash</button>
                <button className="btn btn-ghost" onClick={() => setShowApiInput(false)}>✕</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 16, flex: 1, overflow: "hidden", marginBottom: 0 }}>
        {/* Chat */}
        <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 12px" }}>
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex", gap: 10,
          }}>
            <input
              className="input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Savol yozing... (masalan: bu oy xarajatim ko'p emasmi?)"
              disabled={loading}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-primary"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "..." : "Yuborish →"}
            </button>
          </div>
        </div>

        {/* Sidebar: suggestions + context */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "auto" }}>
          {/* Suggestions */}
          <div className="card">
            <div className="heading-md" style={{ marginBottom: 12 }}>Tezkor savollar</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SUGGESTIONS.map(s => (
                <button key={s}
                  onClick={() => handleSend(s)}
                  disabled={loading}
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-sm)",
                    padding: "9px 12px",
                    color: "var(--text-secondary)",
                    fontSize: 12,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Context info */}
          <div className="card">
            <div className="heading-md" style={{ marginBottom: 12 }}>AI biladi</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["📊", "6 oylik tranzaksiyalar"],
                ["💰", "Daromad & xarajat tarixi"],
                ["📈", "O'sish tendensiyasi"],
                ["⚠️", "Xavf omillari"],
                ["🎯", "Sog'liq balli: 72/100"],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span>{icon}</span>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
