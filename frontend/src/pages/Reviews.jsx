// src/pages/Reviews.jsx
import React, { useState } from "react";
import { api } from "../lib/api";

// ─── STAR RATING COMPONENT ────────────────────────────
function Stars({ count, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= (count || 0) ? "#ffd166" : "var(--text-muted)" }}>★</span>
      ))}
    </span>
  );
}

// ─── SCORE BAR ─────────────────────────────────────────
function ScoreBar({ label, score, icon }) {
  const color = score >= 75 ? "var(--green)" : score >= 50 ? "var(--yellow)" : "var(--red)";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{icon} {label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color, fontFamily: "var(--font-mono)" }}>{score}/100</span>
      </div>
      <div style={{ height: 6, background: "var(--bg-elevated)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${score}%`, borderRadius: 3,
          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

// ─── SENTIMENT GAUGE ───────────────────────────────────
function SentimentGauge({ score, sentiment }) {
  const color = score >= 70 ? "var(--green)" : score >= 40 ? "var(--yellow)" : "var(--red)";
  const emoji = score >= 70 ? "😊" : score >= 40 ? "😐" : "😞";
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto" }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
          <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${score * 3.27} ${327 - score * 3.27}`}
            strokeDashoffset="82" strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 28 }}>{emoji}</span>
          <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)", color }}>{score}</span>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color, textTransform: "capitalize" }}>{sentiment}</div>
    </div>
  );
}

// ─── REVIEW CARD ───────────────────────────────────────
function ReviewCard({ review, index }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.text && review.text.length > 150;

  return (
    <div className="fade-up" style={{
      padding: "14px 16px",
      background: "var(--bg-elevated)",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border-default)",
      animationDelay: `${index * 0.03}s`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: `hsl(${(review.author || "A").charCodeAt(0) * 37 % 360}, 60%, 45%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff",
          }}>
            {(review.author || "A")[0].toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{review.author}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Stars count={review.stars} size={12} />
          {review.date && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{review.date}</span>}
        </div>
      </div>
      {review.text && (
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          {isLong && !expanded ? review.text.slice(0, 150) + "..." : review.text}
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} style={{
              background: "none", border: "none", color: "var(--accent)",
              fontSize: 12, cursor: "pointer", marginLeft: 4,
            }}>{expanded ? "Yopish" : "Ko'proq"}</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── STARS DISTRIBUTION ────────────────────────────────
function StarsDistribution({ reviews }) {
  const dist = [5, 4, 3, 2, 1].map(s => ({
    stars: s,
    count: reviews.filter(r => r.stars === s).length,
  }));
  const max = Math.max(...dist.map(d => d.count), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {dist.map(d => (
        <div key={d.stars} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <span style={{ width: 12, textAlign: "right", color: "var(--text-muted)" }}>{d.stars}</span>
          <span style={{ color: "#ffd166", fontSize: 11 }}>★</span>
          <div style={{ flex: 1, height: 8, background: "var(--bg-elevated)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${(d.count / max) * 100}%`,
              background: "linear-gradient(90deg, #ffd166, #f5a623)",
              borderRadius: 4, transition: "width 0.6s ease",
            }} />
          </div>
          <span style={{ width: 20, textAlign: "right", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{d.count}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────
export default function Reviews() {
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scraped, setScraped] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("input"); // input, scraped, analyzed

  async function handleScrape() {
    if (!url.trim()) return;
    setError(null);
    setScraping(true);
    setScraped(null);
    setAnalysis(null);
    setStep("input");

    try {
      const res = await api.scrapeReviews(url.trim());
      setScraped(res.data);
      setStep("scraped");

      // Avtomatik AI tahlil boshlash
      setAnalyzing(true);
      try {
        const analysisRes = await api.analyzeReviews(res.data);
        setAnalysis(analysisRes.analysis);
        setStep("analyzed");
      } catch (err) {
        console.error("Analyze error:", err);
        // Tahlil xatosi bo'lsa ham scrape natijasini ko'rsatamiz
      } finally {
        setAnalyzing(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setScraping(false);
    }
  }

  function handleReset() {
    setUrl("");
    setScraped(null);
    setAnalysis(null);
    setError(null);
    setStep("input");
  }

  const avgRating = scraped?.reviews?.length
    ? (scraped.reviews.reduce((s, r) => s + (r.stars || 0), 0) / scraped.reviews.filter(r => r.stars).length).toFixed(1)
    : null;

  return (
    <div className="page" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <h1 className="heading-xl">Sharhlar Tahlili ⚡</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
          Google Maps yoki 2GIS linkini kiriting — AI sharhlarni tahlil qiladi
        </p>
      </div>

      {/* URL Input */}
      <div className="card fade-up-1" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 24 }}>🔗</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>Restoran havolasini kiriting</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
              Google Maps yoki 2GIS dagi restoran sahifasining to'liq URL manzilini kiriting
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                className="input"
                type="url"
                placeholder="https://2gis.uz/tashkent/firm/... yoki https://maps.google.com/..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !scraping && handleScrape()}
                disabled={scraping || analyzing}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={handleScrape}
                disabled={scraping || analyzing || !url.trim()}
                style={{ minWidth: 140 }}
              >
                {scraping ? "⏳ Yuklanmoqda..." : "🔍 Tahlil qilish"}
              </button>
              {scraped && (
                <button className="btn btn-ghost" onClick={handleReset}>Tozalash</button>
              )}
            </div>
            {/* Source hints */}
            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
              {[
                { icon: "📍", label: "Google Maps", example: "google.com/maps/place/..." },
                { icon: "🗺️", label: "2GIS", example: "2gis.uz/tashkent/firm/..." },
              ].map(s => (
                <div key={s.label} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "4px 10px", borderRadius: "var(--radius-sm)",
                  background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
                  fontSize: 11, color: "var(--text-muted)",
                }}>
                  {s.icon} {s.label}: <span style={{ fontFamily: "var(--font-mono)" }}>{s.example}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card fade-up" style={{
          marginBottom: 20,
          background: "var(--red-dim)",
          border: "1px solid rgba(255,77,106,0.25)",
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 18 }}>❌</span>
            <div>
              <div style={{ fontWeight: 600, color: "var(--red)" }}>Xatolik yuz berdi</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {(scraping || analyzing) && (
        <div className="card fade-up" style={{ marginBottom: 20, textAlign: "center", padding: 40 }}>
          <div style={{
            width: 48, height: 48, margin: "0 auto 16px",
            border: "3px solid var(--border-default)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
            {scraping ? "🔍 Sharhlar yuklanmoqda..." : "🤖 AI tahlil qilmoqda..."}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {scraping
              ? "Brauzer orqali ma'lumotlar yig'ilmoqda. Bu 15-30 soniya vaqt olishi mumkin."
              : "AI sharhlarni o'qiyapti va statistika tayyorlamoqda..."}
          </div>
        </div>
      )}

      {/* Results */}
      {scraped && !scraping && (
        <>
          {/* Restaurant Header Card */}
          <div className="card fade-up-1" style={{
            marginBottom: 20,
            background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(0,229,195,0.05) 100%)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 24 }}>🍽️</span>
                  <h2 className="heading-lg">{scraped.name}</h2>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {scraped.category && (
                    <span className="badge badge-accent">{scraped.category}</span>
                  )}
                  <span className="badge badge-blue">
                    {scraped.source === "google" ? "📍 Google Maps" : "🗺️ 2GIS"}
                  </span>
                  {scraped.address && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>📌 {scraped.address}</span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {scraped.rating && (
                  <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--accent)" }}>
                    {scraped.rating}
                  </div>
                )}
                <Stars count={Math.round(scraped.rating || 0)} size={16} />
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {scraped.totalReviews || scraped.reviews.length} ta sharh
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: analysis ? "1fr 1fr" : "1fr", gap: 16, marginBottom: 20 }}>
            {/* AI Analysis */}
            {analysis && (
              <div className="card fade-up-2" style={{ display: "flex", flexDirection: "column" }}>
                <div className="heading-md" style={{ marginBottom: 16 }}>🤖 AI Tahlil</div>

                <SentimentGauge score={analysis.sentimentScore} sentiment={analysis.overallSentiment} />

                <div className="divider" />

                {/* Categories */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Kategoriya baholari</div>
                  {analysis.categories && Object.entries(analysis.categories).map(([key, val]) => {
                    const icons = {
                      taom_sifati: "🍕", xizmat_sifati: "🤝", atmosfera: "✨",
                      narx_arzirligi: "💰", tozalik: "🧹",
                    };
                    const labels = {
                      taom_sifati: "Taom sifati", xizmat_sifati: "Xizmat sifati",
                      atmosfera: "Atmosfera", narx_arzirligi: "Narx/Arzirlik", tozalik: "Tozalik",
                    };
                    return <ScoreBar key={key} label={labels[key] || key} score={val.score} icon={icons[key] || "📊"} />;
                  })}
                </div>

                <div className="divider" />

                {/* Strengths */}
                {analysis.strengths?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--green)", marginBottom: 8 }}>💪 Kuchli tomonlar</div>
                    {analysis.strengths.map((s, i) => (
                      <div key={i} style={{
                        padding: "6px 10px", marginBottom: 4, borderRadius: "var(--radius-sm)",
                        background: "var(--green-dim)", fontSize: 13, color: "var(--text-secondary)",
                      }}>✅ {s}</div>
                    ))}
                  </div>
                )}

                {/* Weaknesses */}
                {analysis.weaknesses?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--red)", marginBottom: 8 }}>⚠️ Zaif tomonlar</div>
                    {analysis.weaknesses.map((w, i) => (
                      <div key={i} style={{
                        padding: "6px 10px", marginBottom: 4, borderRadius: "var(--radius-sm)",
                        background: "var(--red-dim)", fontSize: 13, color: "var(--text-secondary)",
                      }}>⛔ {w}</div>
                    ))}
                  </div>
                )}

                <div className="divider" />

                {/* Recommendation */}
                {analysis.recommendation && (
                  <div style={{
                    padding: "12px 14px",
                    background: "var(--accent-dim)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(0,229,195,0.15)",
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 4 }}>📋 Tavsiya</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{analysis.recommendation}</div>
                  </div>
                )}

                {/* Competitor Advice */}
                {analysis.competitorAdvice && (
                  <div style={{
                    padding: "12px 14px", marginTop: 8,
                    background: "var(--amber-dim)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(245,166,35,0.15)",
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--amber)", marginBottom: 4 }}>🏆 Raqobatchilar uchun</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{analysis.competitorAdvice}</div>
                  </div>
                )}
              </div>
            )}

            {/* Stats + Distribution */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Quick Stats */}
              <div className="card fade-up-2">
                <div className="heading-md" style={{ marginBottom: 16 }}>📊 Statistika</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "O'rtacha reyting", value: avgRating || "—", icon: "⭐", color: "var(--yellow)" },
                    { label: "Jami sharhlar", value: scraped.totalReviews || scraped.reviews.length, icon: "💬", color: "var(--blue)" },
                    { label: "Yuklangan", value: scraped.reviews.length, icon: "📥", color: "var(--accent)" },
                    { label: "Matni bor", value: scraped.reviews.filter(r => r.text).length, icon: "📝", color: "var(--green)" },
                  ].map(stat => (
                    <div key={stat.label} style={{
                      padding: "14px", borderRadius: "var(--radius-md)",
                      background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
                    }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{stat.icon} {stat.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)", color: stat.color }}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stars Distribution */}
              <div className="card fade-up-3">
                <div className="heading-md" style={{ marginBottom: 16 }}>⭐ Yulduz taqsimoti</div>
                <StarsDistribution reviews={scraped.reviews} />
              </div>

              {/* Themes */}
              {analysis && (
                <div className="card fade-up-3">
                  <div className="heading-md" style={{ marginBottom: 12 }}>🏷️ Asosiy temalar</div>
                  {analysis.topPositiveThemes?.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: "var(--green)", marginBottom: 6, fontWeight: 600 }}>IJOBIY</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {analysis.topPositiveThemes.map((t, i) => (
                          <span key={i} className="badge badge-green">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.topNegativeThemes?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: "var(--red)", marginBottom: 6, fontWeight: 600 }}>SALBIY</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {analysis.topNegativeThemes.map((t, i) => (
                          <span key={i} className="badge badge-red">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div className="card fade-up-3">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="heading-md">💬 Sharhlar ({scraped.reviews.length})</div>
              {analyzing && <span className="badge badge-accent">🤖 AI tahlil qilmoqda...</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 500, overflowY: "auto" }}>
              {scraped.reviews.length > 0 ? (
                scraped.reviews.map((r, i) => <ReviewCard key={i} review={r} index={i} />)
              ) : (
                <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                  Sharhlar topilmadi. Sahifadan ma'lumotlar yuklanmagan bo'lishi mumkin.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!scraped && !scraping && !error && (
        <div className="fade-up-2" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
            Restoran sharhlarini tahlil qiling
          </div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            Google Maps yoki 2GIS dan restoran havolasini kiriting.<br />
            AI barcha sharhlarni o'qib, batafsil statistika va tavsiyalar tayyorlaydi.
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24 }}>
            {[
              { icon: "📊", label: "Reyting tahlili" },
              { icon: "😊", label: "Sentiment tahlili" },
              { icon: "💪", label: "Kuchli/zaif tomonlar" },
              { icon: "🏆", label: "Raqobat maslahat" },
            ].map(f => (
              <div key={f.label} style={{
                padding: "12px 16px", borderRadius: "var(--radius-md)",
                background: "var(--bg-card)", border: "1px solid var(--border-default)",
                fontSize: 12, color: "var(--text-secondary)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 16 }}>{f.icon}</span> {f.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
