// src/pages/Forecast.jsx
import React, { useEffect, useState } from "react";
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { api, formatAmount } from "../lib/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-elevated)", border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius-md)", padding: "12px 16px",
    }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.name}:</span>
          <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            {formatAmount(p.value)} so'm
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Forecast() {
  const [forecast, setForecast] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getForecast(), api.getMonthly()]).then(([f, m]) => {
      setForecast(f);
      setMonthly(m);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="page">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 120, marginBottom: 16 }} />
      ))}
    </div>
  );

  const lastMonthIncome = monthly[monthly.length - 1]?.income || 0;
  const predictedNext = forecast[0]?.predicted || 0;
  const growth = lastMonthIncome ? Math.round(((predictedNext - lastMonthIncome) / lastMonthIncome) * 100) : 0;
  const totalPredicted = forecast.reduce((s, f) => s + f.predicted, 0);
  const totalOptimistic = forecast.reduce((s, f) => s + f.optimistic, 0);

  return (
    <div className="page">
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 className="heading-xl" style={{ marginBottom: 6 }}>Moliyaviy Bashorat ◇</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Tarixiy ma'lumotlar asosida keyingi 6 oyga prognoz
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid-3 fade-up-1" style={{ marginBottom: 20 }}>
        {[
          {
            label: "KEYINGI OY BASHORATI",
            value: `${formatAmount(predictedNext)} so'm`,
            sub: `O'tgan oydan ${growth >= 0 ? "+" : ""}${growth}%`,
            color: "var(--accent)",
            trend: growth
          },
          {
            label: "6 OYLIK JAMI (TAXMIN)",
            value: `${formatAmount(totalPredicted)} so'm`,
            sub: "O'rtacha stsenariy",
            color: "var(--blue)",
          },
          {
            label: "6 OYLIK JAMI (OPTIMISTIK)",
            value: `${formatAmount(totalOptimistic)} so'm`,
            sub: "Yuqori o'sish stsenariy",
            color: "var(--green)",
          },
        ].map((card, i) => (
          <div key={i} className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: card.color }} />
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 10, letterSpacing: "0.06em" }}>
              {card.label}
            </div>
            <div className="stat-number">{card.value}</div>
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
              {card.trend !== undefined && (
                <span style={{ color: card.trend >= 0 ? "var(--green)" : "var(--red)", fontWeight: 600, marginRight: 6, fontFamily: "var(--font-mono)" }}>
                  {card.trend >= 0 ? "▲" : "▼"} {Math.abs(card.trend)}%
                </span>
              )}
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Main forecast chart */}
      <div className="card fade-up-2" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 20 }}>
          <div className="heading-md">6 Oylik Daromad Bashorati</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            3 ta stsenariy: pessimistik, o'rtacha va optimistik
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={forecast}>
            <defs>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => formatAmount(v)} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area dataKey="pessimistic" name="Pessimistik" fill="var(--red-dim)" stroke="var(--red)" strokeWidth={1.5} strokeDasharray="4 2" />
            <Area dataKey="predicted" name="O'rtacha" fill="url(#predGrad)" stroke="var(--accent)" strokeWidth={2.5} />
            <Line dataKey="optimistic" name="Optimistik" stroke="var(--green)" strokeWidth={2} dot={{ r: 4, fill: "var(--green)" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast table */}
      <div className="card fade-up-3">
        <div className="heading-md" style={{ marginBottom: 16 }}>Oylik Prognoz Jadvali</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Oy", "Pessimistik", "O'rtacha", "Optimistik", "O'rtacha o'sish"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "8px 12px",
                    fontSize: 11, color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {forecast.map((row, i) => {
                const prev = i === 0 ? (monthly[monthly.length - 1]?.income || row.predicted) : forecast[i - 1].predicted;
                const growth = Math.round(((row.predicted - prev) / prev) * 100);
                return (
                  <tr key={row.label} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 12px", fontWeight: 600, fontFamily: "var(--font-display)" }}>{row.label}</td>
                    <td style={{ padding: "12px 12px", color: "var(--red)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                      {formatAmount(row.pessimistic)} so'm
                    </td>
                    <td style={{ padding: "12px 12px", color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600 }}>
                      {formatAmount(row.predicted)} so'm
                    </td>
                    <td style={{ padding: "12px 12px", color: "var(--green)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                      {formatAmount(row.optimistic)} so'm
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      <span className={`badge ${growth >= 0 ? "badge-green" : "badge-red"}`}>
                        {growth >= 0 ? "▲" : "▼"} {Math.abs(growth)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
