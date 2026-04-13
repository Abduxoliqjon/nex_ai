// src/lib/api.js
const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Server xatosi");
  return data;
}

export const api = {
  getDashboard: () => request("/dashboard"),
  getTransactions: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("/transactions" + (q ? "?" + q : ""));
  },
  addTransaction: (body) => request("/transactions", { method: "POST", body }),
  getMonthly: () => request("/analytics/monthly"),
  getCategories: (type) => request("/analytics/categories?type=" + type),
  getHealth: () => request("/analytics/health"),
  getForecast: () => request("/forecast"),
  getAlerts: () => request("/alerts"),
  chat: (message) => request("/ai/chat", { method: "POST", body: { message } }),
  scenario: (scenario) => request("/ai/scenario", { method: "POST", body: { scenario } }),
  expansion: () => request("/ai/expansion"),
  setApiKey: (apiKey) => request("/settings/api-key", { method: "POST", body: { apiKey } }),
  getStatus: () => request("/settings/status"),
  scrapeReviews: (url) => request("/reviews/scrape", { method: "POST", body: { url } }),
  analyzeReviews: (scrapedData) => request("/reviews/analyze", { method: "POST", body: { scrapedData } }),
};

export function formatAmount(amount) {
  if (!amount && amount !== 0) return "—";
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1) + " mlrd";
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + " mln";
  if (amount >= 1_000) return (amount / 1_000).toFixed(0) + "K";
  return amount.toLocaleString();
}

export function formatAmountFull(amount) {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
}

export function getMonthLabel(dateStr) {
  const d = new Date(dateStr + "-01");
  return d.toLocaleDateString("uz-UZ", { month: "short", year: "2-digit" });
}
