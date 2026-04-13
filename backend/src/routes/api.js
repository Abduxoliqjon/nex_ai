// src/routes/api.js
import express from "express";
import {
  demoTransactions,
  demoUser,
  getMonthlyData,
  getCategoryBreakdown,
  getHealthScore,
  getForecastData,
  getAlerts
} from "../data/seedData.js";

import {
  initGemini,
  getModel,
  getAIAdvice,
  analyzeScenario,
  getExpansionAnalysis
} from "../services/geminiService.js";

import {
  scrapeReviews,
  analyzeReviews
} from "../services/scraperService.js";

const router = express.Router();

// ─── STATE ─────────────────────────────────────────────
let transactions = [...demoTransactions];
let apiKeySet = true; // API key kodda mavjud — avtomatik ulangan

// ─── HELPERS ───────────────────────────────────────────
function getBusinessSummary() {
  const monthly = getMonthlyData();
  const last = monthly[monthly.length - 1];
  const prev = monthly[monthly.length - 2];
  const health = getHealthScore();
  const alerts = getAlerts().map(a => a.title);

  const avgIncome =
    monthly.reduce((s, m) => s + m.income, 0) / monthly.length;

  const avgProfit =
    monthly.reduce((s, m) => s + m.profit, 0) / monthly.length;

  const growthTrend = prev
    ? Math.round(((last.income - prev.income) / prev.income) * 100)
    : 0;

  return {
    ...demoUser,
    lastMonthIncome: last?.income || 0,
    lastMonthExpense: last?.expense || 0,
    lastMonthProfit: last?.profit || 0,
    healthScore: health.score,
    healthStatus: health.status,
    growthTrend,
    alerts,
    avgIncome,
    avgProfit
  };
}

// ─── DASHBOARD ─────────────────────────────────────────
router.get("/dashboard", (req, res) => {
  const monthly = getMonthlyData();
  const last = monthly[monthly.length - 1];
  const prev = monthly[monthly.length - 2];
  const health = getHealthScore();
  const alerts = getAlerts();
  const forecast = getForecastData();

  const totalIncome = monthly.reduce((s, m) => s + m.income, 0);
  const totalExpense = monthly.reduce((s, m) => s + m.expense, 0);

  const growthPercent = prev
    ? Math.round(((last.income - prev.income) / prev.income) * 100)
    : 0;

  res.json({
    user: demoUser,
    summary: {
      totalIncome,
      totalExpense,
      totalProfit: totalIncome - totalExpense,
      lastMonthIncome: last?.income || 0,
      lastMonthExpense: last?.expense || 0,
      lastMonthProfit: last?.profit || 0,
      growthPercent,
      transactionCount: transactions.length
    },
    health,
    alerts,
    monthly,
    forecast: forecast.slice(0, 3),
    apiKeySet
  });
});

// ─── TRANSACTIONS ──────────────────────────────────────
router.get("/transactions", (req, res) => {
  const { type, category, limit = 20, page = 1 } = req.query;

  let filtered = [...transactions];

  if (type) filtered = filtered.filter(t => t.type === type);
  if (category) filtered = filtered.filter(t => t.category === category);

  const total = filtered.length;

  const start = (page - 1) * limit;
  const end = page * limit;

  const paginated = filtered.slice(start, end);

  res.json({
    transactions: paginated,
    total,
    page: Number(page),
    limit: Number(limit)
  });
});

router.post("/transactions", (req, res) => {
  const { type, amount, category, description, date } = req.body;

  if (!type || !amount || !category) {
    return res.status(400).json({
      error: "type, amount, category majburiy"
    });
  }

  const newTransaction = {
    id: `t-${Date.now()}`,
    type,
    amount: Number(amount),
    category,
    description: description || "",
    date: date || new Date().toISOString().split("T")[0],
    userId: "demo-user-001"
  };

  transactions.unshift(newTransaction);

  res.status(201).json(newTransaction);
});

// ─── ANALYTICS ─────────────────────────────────────────
router.get("/analytics/monthly", (req, res) => {
  res.json(getMonthlyData());
});

router.get("/analytics/categories", (req, res) => {
  const { type = "expense" } = req.query;
  res.json(getCategoryBreakdown(type));
});

router.get("/analytics/health", (req, res) => {
  res.json(getHealthScore());
});

// ─── FORECAST ──────────────────────────────────────────
router.get("/forecast", (req, res) => {
  res.json(getForecastData());
});

// ─── ALERTS ────────────────────────────────────────────
router.get("/alerts", (req, res) => {
  res.json(getAlerts());
});

// ─── AI CHAT ───────────────────────────────────────────
router.post("/ai/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      error: "message majburiy"
    });
  }

  try {
    const model = getModel();

    const businessData = getBusinessSummary();

    const result = await model.generateContent(
      `${message}\n\nDATA:\n${JSON.stringify(businessData)}`
    );

    const reply = result.response.text();

    res.json({
      reply,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: "AI error",
      details: error.message
    });
  }
});

// ─── SCENARIO ──────────────────────────────────────────
router.post("/ai/scenario", async (req, res) => {
  const { scenario } = req.body;

  if (!scenario) {
    return res.status(400).json({
      error: "scenario majburiy"
    });
  }

  try {
    const businessData = getBusinessSummary();
    const analysis = await analyzeScenario(scenario, businessData);

    res.json({
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ─── EXPANSION ─────────────────────────────────────────
router.get("/ai/expansion", async (req, res) => {
  try {
    const businessData = getBusinessSummary();
    const analysis = await getExpansionAnalysis(businessData);

    res.json({
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ─── API KEY SETUP (FIXED + VERIFIED) ──────────────────
router.post("/settings/api-key", async (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({
      error: "apiKey majburiy"
    });
  }

  try {
    initGemini(apiKey);

    // 🔥 REAL TEST REQUEST — model allaqachon initGemini ichida yaratilgan
    const testModel = getModel();
    await testModel.generateContent("ping");

    apiKeySet = true;

    res.json({
      success: true,
      message: "API kalit ishlayapti va ulandi"
    });
  } catch (error) {
    apiKeySet = false;

    res.status(401).json({
      success: false,
      error: "API key noto‘g‘ri yoki ishlamayapti",
      details: error.message
    });
  }
});

// ─── REVIEWS SCRAPER ───────────────────────────────────
router.post("/reviews/scrape", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "url majburiy" });
  }

  try {
    console.log(`🔍 Scraping: ${url}`);
    const data = await scrapeReviews(url);

    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Scrape xatosi:", error.message);
    res.status(500).json({
      error: error.message || "Scraping xatosi yuz berdi",
    });
  }
});

router.post("/reviews/analyze", async (req, res) => {
  const { scrapedData } = req.body;

  if (!scrapedData) {
    return res.status(400).json({ error: "scrapedData majburiy" });
  }

  try {
    const analysis = await analyzeReviews(scrapedData);

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analyze xatosi:", error.message);
    res.status(500).json({
      error: error.message || "Tahlil xatosi yuz berdi",
    });
  }
});

// ─── STATUS ────────────────────────────────────────────
router.get("/settings/status", (req, res) => {
  res.json({
    apiKeySet
  });
});

export default router;