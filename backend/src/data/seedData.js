// src/data/seedData.js
// Realistic demo data for "Milliy Taomlar" restaurant in Tashkent

export const demoUser = {
  id: "demo-user-001",
  businessName: "Milliy Taomlar",
  businessType: "restoran",
  owner: "Jasur Toshmatov",
  location: "Toshkent, Chilonzor",
  currency: "UZS",
  createdAt: "2024-01-01"
};

// Generate 6 months of transactions
function generateTransactions() {
  const transactions = [];
  const startDate = new Date("2024-07-01");
  let id = 1;

  const incomeCategories = ["Savdo daromadi", "Yetkazib berish", "Katering", "Onlayn buyurtma"];
  const expenseCategories = ["Xomashyo", "Ijara", "Xodimlar", "Kommunal", "Marketing", "Jihozlar", "Boshqa"];

  const monthlyPatterns = [
    { month: 0, incomeBase: 45000000, expenseBase: 32000000 },  // July
    { month: 1, incomeBase: 48000000, expenseBase: 33000000 },  // August
    { month: 2, incomeBase: 52000000, expenseBase: 35000000 },  // September
    { month: 3, incomeBase: 49000000, expenseBase: 34000000 },  // October
    { month: 4, incomeBase: 55000000, expenseBase: 36000000 },  // November
    { month: 5, incomeBase: 61000000, expenseBase: 38000000 },  // December
  ];

  monthlyPatterns.forEach(({ month, incomeBase, expenseBase }) => {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + month);

    // Daily income (25 days per month)
    for (let day = 1; day <= 25; day++) {
      const variance = 0.7 + Math.random() * 0.6;
      const amount = Math.round((incomeBase / 25) * variance);
      const date = new Date(monthDate);
      date.setDate(day);

      transactions.push({
        id: `t-${id++}`,
        type: "income",
        amount,
        category: incomeCategories[Math.floor(Math.random() * incomeCategories.length)],
        description: day % 5 === 0 ? "Katta buyurtma" : "Kunlik savdo",
        date: date.toISOString().split("T")[0],
        userId: "demo-user-001"
      });
    }

    // Monthly expenses
    const expenses = [
      { category: "Ijara", amount: 8000000, day: 1, description: "Oylik ijara to'lovi" },
      { category: "Xodimlar", amount: Math.round(expenseBase * 0.35), day: 5, description: "Xodimlar ish haqi" },
      { category: "Xomashyo", amount: Math.round(expenseBase * 0.30), day: 3, description: "Oziq-ovqat xomashyosi" },
      { category: "Xomashyo", amount: Math.round(expenseBase * 0.10), day: 15, description: "Qo'shimcha xomashyo" },
      { category: "Kommunal", amount: 1500000, day: 10, description: "Elektr va gaz" },
      { category: "Marketing", amount: 800000, day: 12, description: "Ijtimoiy tarmoq reklama" },
      { category: "Boshqa", amount: Math.round(expenseBase * 0.05), day: 20, description: "Xo'jalik xarajatlari" },
    ];

    expenses.forEach(exp => {
      const date = new Date(monthDate);
      date.setDate(exp.day);
      transactions.push({
        id: `t-${id++}`,
        type: "expense",
        amount: exp.amount,
        category: exp.category,
        description: exp.description,
        date: date.toISOString().split("T")[0],
        userId: "demo-user-001"
      });
    });
  });

  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export const demoTransactions = generateTransactions();

// Calculate monthly summaries
export function getMonthlyData() {
  const monthly = {};
  demoTransactions.forEach(t => {
    const month = t.date.substring(0, 7);
    if (!monthly[month]) monthly[month] = { income: 0, expense: 0, month };
    if (t.type === "income") monthly[month].income += t.amount;
    else monthly[month].expense += t.amount;
  });

  return Object.values(monthly)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(m => ({
      ...m,
      profit: m.income - m.expense,
      label: new Date(m.month + "-01").toLocaleDateString("uz-UZ", { month: "short", year: "numeric" })
    }));
}

export function getCategoryBreakdown(type = "expense") {
  const categories = {};
  demoTransactions
    .filter(t => t.type === type)
    .forEach(t => {
      if (!categories[t.category]) categories[t.category] = 0;
      categories[t.category] += t.amount;
    });

  const total = Object.values(categories).reduce((a, b) => a + b, 0);
  return Object.entries(categories)
    .map(([name, value]) => ({ name, value, percent: Math.round((value / total) * 100) }))
    .sort((a, b) => b.value - a.value);
}

export function getHealthScore() {
  const monthly = getMonthlyData();
  const last3 = monthly.slice(-3);

  // Cashflow score: all months profitable
  const allProfitable = last3.every(m => m.profit > 0);
  const cashflowScore = allProfitable ? 25 : last3.filter(m => m.profit > 0).length * 8;

  // Growth score: revenue trending up
  const revenueGrowth = last3.length >= 2
    ? (last3[last3.length - 1].income - last3[0].income) / last3[0].income
    : 0;
  const growthScore = Math.min(25, Math.max(0, Math.round(revenueGrowth * 100)));

  // Expense ratio score
  const avgExpenseRatio = last3.reduce((sum, m) => sum + (m.expense / m.income), 0) / last3.length;
  const expenseScore = avgExpenseRatio < 0.6 ? 25 : avgExpenseRatio < 0.75 ? 18 : avgExpenseRatio < 0.9 ? 10 : 5;

  // Regularity score (we have data = regular)
  const regularityScore = 20;

  const total = cashflowScore + growthScore + expenseScore + regularityScore;

  return {
    score: Math.min(100, total),
    breakdown: {
      cashflow: cashflowScore,
      growth: growthScore,
      expenseRatio: expenseScore,
      regularity: regularityScore
    },
    status: total >= 70 ? "healthy" : total >= 40 ? "warning" : "critical"
  };
}

export function getForecastData() {
  const monthly = getMonthlyData();
  const lastIncome = monthly[monthly.length - 1]?.income || 50000000;
  const growthRate = 0.06; // 6% monthly growth

  const months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun"];
  return months.map((label, i) => ({
    label,
    predicted: Math.round(lastIncome * Math.pow(1 + growthRate, i + 1)),
    optimistic: Math.round(lastIncome * Math.pow(1 + growthRate * 1.5, i + 1)),
    pessimistic: Math.round(lastIncome * Math.pow(1 + growthRate * 0.4, i + 1))
  }));
}

export function getAlerts() {
  return [
    {
      id: "a1",
      type: "opportunity",
      severity: "low",
      title: "Kengayishga tayyor!",
      message: "So'nggi 3 oyda barqaror o'sish kuzatildi. Ikkinchi filial ochish vaqti keldi.",
      icon: "🚀",
      action: "Tahlil ko'rish"
    },
    {
      id: "a2",
      type: "warning",
      severity: "medium",
      title: "Xomashyo xarajati oshyapti",
      message: "Xomashyo xarajati o'tgan oyga nisbatan 12% oshdi. Yetkazib beruvchilarni taqqoslang.",
      icon: "⚠️",
      action: "Batafsil"
    },
    {
      id: "a3",
      type: "info",
      severity: "low",
      title: "Soliq muddati yaqinlashmoqda",
      message: "Chorak soliq hisobotini 15 kun ichida topshiring. Hujjatlar tayyor.",
      icon: "📋",
      action: "Hisobot"
    }
  ];
}
