// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { api, formatAmount } from "../lib/api";
import HealthGauge from "../components/charts/HealthGauge";

function StatCard({ label, value, sub, color, trend, delay = 0 }) {
  return (
    <div className={`card fade-up-${delay}`} style={{ position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: color || "var(--accent)",
        opacity: 0.7,
      }} />
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", marginBottom: 10 }}>
        {label}
      </div>
      <div className="stat-number" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>
      {sub && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
          {trend !== undefined && (
            <span style={{ color: trend >= 0 ? "var(--green)" : "var(--red)", fontWeight: 600, marginRight: 6, fontFamily: "var(--font-mono)" }}>
              {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
            </span>
          )}
          {sub}
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius-md)",
      padding: "12px 16px",
    }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.name}:</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
            {formatAmount(p.value)} so'm
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="page">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 120 }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        <div className="skeleton" style={{ height: 300 }} />
        <div className="skeleton" style={{ height: 300 }} />
      </div>
    </div>
  );

  const { summary, health, alerts, monthly, forecast } = data;

  return (
    <div className="page">
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="heading-xl" style={{ marginBottom: 6 }}>
            Salom, Jasur 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Milliy Taomlar — moliyaviy holat sharhi
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--green-dim)", border: "1px solid rgba(34,217,142,0.2)",
          borderRadius: "var(--radius-sm)", padding: "8px 14px",
        }}>
          <div className="glow-dot" style={{ background: "var(--green)" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)", fontFamily: "var(--font-mono)" }}>
            BIZNES SALOMAT
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <StatCard
          label="JAMI DAROMAD (6 OY)"
          value={`${formatAmount(summary.totalIncome)} so'm`}
          sub="so'nggi 6 oy"
          color="var(--accent)"
          delay={1}
        />
        <StatCard
          label="O'TGAN OY DAROMADI"
          value={`${formatAmount(summary.lastMonthIncome)} so'm`}
          trend={summary.growthPercent}
          sub="o'tgan oyga nisbatan"
          color="var(--green)"
          delay={2}
        />
        <StatCard
          label="OYLIK FOYDA"
          value={`${formatAmount(summary.lastMonthProfit)} so'm`}
          sub={`${Math.round((summary.lastMonthProfit / summary.lastMonthIncome) * 100)}% foyda marginali`}
          color="var(--blue)"
          delay={3}
        />
        <StatCard
          label="JAMI TRANZAKSIYA"
          value={summary.transactionCount}
          sub="6 oy davomida"
          color="var(--amber)"
          delay={4}
        />
      </div>

      {/* Main charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 16 }}>
        {/* Revenue chart */}
        <div className="card fade-up-2">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div className="heading-md">Daromad & Xarajat</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>So'nggi 6 oy dinamikasi</div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[["var(--accent)", "Daromad"], ["var(--red)", "Xarajat"], ["var(--green)", "Foyda"]].map(([color, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => formatAmount(v)} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area dataKey="income" name="Daromad" stroke="var(--accent)" strokeWidth={2} fill="url(#incomeGrad)" />
              <Area dataKey="expense" name="Xarajat" stroke="var(--red)" strokeWidth={2} fill="none" strokeDasharray="4 2" />
              <Area dataKey="profit" name="Foyda" stroke="var(--green)" strokeWidth={2} fill="url(#profitGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Health gauge */}
        <div className="card fade-up-3" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div className="heading-md">Biznes Sog'ligi</div>
            <span className={`badge badge-green`}>+{summary.growthPercent}%</span>
          </div>
          <HealthGauge score={health.score} breakdown={health.breakdown} status={health.status} />
        </div>
      </div>

      {/* Bottom row: forecast + alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Mini forecast */}
        <div className="card fade-up-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div className="heading-md">Bashorat — 3 oy</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Taxminiy daromad o'sishi</div>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => onNavigate("forecast")}>
              Batafsil →
            </button>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={forecast} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => formatAmount(v)} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="predicted" name="Bashorat" fill="var(--accent)" opacity={0.8} radius={[4, 4, 0, 0]} />
              <Bar dataKey="optimistic" name="Optimistik" fill="var(--green)" opacity={0.4} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div className="card fade-up-4">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div className="heading-md">Ogohlantirishlar</div>
            <span className="badge badge-yellow">{alerts.length} faol</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {alerts.map(alert => {
              const colors = { low: "var(--blue)", medium: "var(--yellow)", high: "var(--red)" };
              const bgColors = { low: "var(--blue-dim)", medium: "var(--yellow-dim)", high: "var(--red-dim)" };
              return (
                <div key={alert.id} style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  padding: "12px 14px",
                  background: bgColors[alert.severity],
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${colors[alert.severity]}20`,
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{alert.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{alert.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>{alert.message}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
