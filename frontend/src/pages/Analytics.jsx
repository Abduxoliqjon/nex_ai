// src/pages/Analytics.jsx
import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { api, formatAmount } from "../lib/api";
import HealthGauge from "../components/charts/HealthGauge";

const COLORS = ["var(--accent)", "var(--blue)", "var(--green)", "var(--amber)", "var(--red)", "#a78bfa", "#fb923c"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-elevated)", border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius-md)", padding: "12px 16px",
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{payload[0].name}</div>
      <div style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
        {formatAmount(payload[0].value)} so'm
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{payload[0].payload.percent}%</div>
    </div>
  );
};

export default function Analytics() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [health, setHealth] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getCategories("expense"),
      api.getCategories("income"),
      api.getHealth(),
      api.getMonthly(),
    ]).then(([e, i, h, m]) => {
      setExpenses(e);
      setIncomes(i);
      setHealth(h);
      setMonthly(m);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="page">
      <div className="grid-2">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 300 }} />)}
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 className="heading-xl" style={{ marginBottom: 6 }}>Tahlil ◈</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Xarajat tuzilmasi, daromad manbalari va biznes sog'ligi
        </p>
      </div>

      {/* Top row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: 16, marginBottom: 16 }}>
        {/* Expense Pie */}
        <div className="card fade-up-1">
          <div className="heading-md" style={{ marginBottom: 4 }}>Xarajat Tuzilmasi</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Kategoriyalar bo'yicha</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <PieChart width={160} height={160}>
              <Pie data={expenses} cx={75} cy={75} innerRadius={45} outerRadius={72}
                dataKey="value" paddingAngle={3}>
                {expenses.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              {expenses.slice(0, 5).map((e, i) => (
                <div key={e.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{e.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{e.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Income Pie */}
        <div className="card fade-up-2">
          <div className="heading-md" style={{ marginBottom: 4 }}>Daromad Manbalari</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Kategoriyalar bo'yicha</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <PieChart width={160} height={160}>
              <Pie data={incomes} cx={75} cy={75} innerRadius={45} outerRadius={72}
                dataKey="value" paddingAngle={3}>
                {incomes.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              {incomes.slice(0, 5).map((inc, i) => (
                <div key={inc.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{inc.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{inc.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health gauge */}
        <div className="card fade-up-3" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="heading-md" style={{ marginBottom: 12, alignSelf: "flex-start" }}>Sog'liq Balli</div>
          {health && <HealthGauge score={health.score} breakdown={health.breakdown} status={health.status} />}
        </div>
      </div>

      {/* Monthly profit bar chart */}
      <div className="card fade-up-3">
        <div style={{ marginBottom: 16 }}>
          <div className="heading-md">Oylik Foyda Dinamikasi</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Har oylik sof foyda</div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => formatAmount(v)} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "12px 16px" }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontFamily: "var(--font-mono)", color: "var(--green)", fontSize: 14, fontWeight: 600 }}>
                    Foyda: {formatAmount(payload[0]?.value)} so'm
                  </div>
                </div>
              );
            }} />
            <Bar dataKey="profit" name="Foyda" fill="var(--green)" opacity={0.8} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
