// src/pages/Transactions.jsx
import React, { useEffect, useState } from "react";
import { api, formatAmount } from "../lib/api";

const INCOME_CATS = ["Savdo daromadi", "Yetkazib berish", "Katering", "Onlayn buyurtma"];
const EXPENSE_CATS = ["Xomashyo", "Ijara", "Xodimlar", "Kommunal", "Marketing", "Jihozlar", "Boshqa"];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "income", amount: "", category: "", description: "", date: new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);

  function load(p = 1, f = filter) {
    setLoading(true);
    const params = { limit: 15, page: p };
    if (f !== "all") params.type = f;
    api.getTransactions(params).then(d => {
      setTransactions(d.transactions);
      setTotal(d.total);
      setLoading(false);
    });
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!form.amount || !form.category) return;
    setSaving(true);
    try {
      await api.addTransaction({ ...form, amount: Number(form.amount) });
      setShowForm(false);
      setForm({ type: "income", amount: "", category: "", description: "", date: new Date().toISOString().split("T")[0] });
      load(1);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="page">
      <div className="fade-up" style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="heading-xl" style={{ marginBottom: 6 }}>Tranzaksiyalar ≡</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Barcha kirim va chiqimlar</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Yopish" : "+ Tranzaksiya qo'shish"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card fade-up" style={{ marginBottom: 20, background: "var(--bg-elevated)" }}>
          <div className="heading-md" style={{ marginBottom: 16 }}>Yangi tranzaksiya</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
            <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, category: "" }))}>
              <option value="income">📈 Kirim</option>
              <option value="expense">📉 Chiqim</option>
            </select>
            <input className="input" type="number" placeholder="Miqdor (so'm)" value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Kategoriya</option>
              {(form.type === "income" ? INCOME_CATS : EXPENSE_CATS).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input className="input" placeholder="Izoh (ixtiyoriy)" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <input className="input" type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>
              {saving ? "Saqlanmoqda..." : "✓ Saqlash"}
            </button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Bekor qilish</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="fade-up-1" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["all", "Barchasi"], ["income", "Kirim"], ["expense", "Chiqim"]].map(([val, label]) => (
          <button key={val} className={`btn ${filter === val ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: 13, padding: "7px 16px" }}
            onClick={() => { setFilter(val); setPage(1); load(1, val); }}>
            {label}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>
          Jami: {total} ta
        </span>
      </div>

      {/* Table */}
      <div className="card fade-up-2" style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
              {["Sana", "Tur", "Kategoriya", "Izoh", "Miqdor"].map(h => (
                <th key={h} style={{
                  textAlign: "left", padding: "14px 20px",
                  fontSize: 11, color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)", letterSpacing: "0.06em",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} style={{ padding: "12px 20px" }}>
                    <div className="skeleton" style={{ height: 20 }} />
                  </td>
                </tr>
              ))
            ) : transactions.map((t, i) => (
              <tr key={t.id} style={{
                borderBottom: "1px solid var(--border-subtle)",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  {t.date}
                </td>
                <td style={{ padding: "12px 20px" }}>
                  <span className={`badge ${t.type === "income" ? "badge-green" : "badge-red"}`}>
                    {t.type === "income" ? "↑ Kirim" : "↓ Chiqim"}
                  </span>
                </td>
                <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text-secondary)" }}>{t.category}</td>
                <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text-muted)" }}>{t.description || "—"}</td>
                <td style={{
                  padding: "12px 20px", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13,
                  color: t.type === "income" ? "var(--green)" : "var(--red)",
                }}>
                  {t.type === "income" ? "+" : "-"}{formatAmount(t.amount)} so'm
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "14px 20px", display: "flex", gap: 8, justifyContent: "center", borderTop: "1px solid var(--border-subtle)" }}>
            <button className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 13 }}
              disabled={page === 1} onClick={() => { setPage(p => p - 1); load(page - 1); }}>
              ← Oldingi
            </button>
            <span style={{ padding: "6px 14px", fontSize: 13, color: "var(--text-muted)" }}>
              {page} / {totalPages}
            </span>
            <button className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 13 }}
              disabled={page === totalPages} onClick={() => { setPage(p => p + 1); load(page + 1); }}>
              Keyingi →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
