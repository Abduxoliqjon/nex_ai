// src/services/geminiService.js
// OpenRouter API orqali ishlaydi (OpenAI-compatible)

const API_KEY = "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";
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.0-flash-001";

let isReady = false;

// ─── CORE REQUEST ──────────────────────────────────────
async function chatRequest(messages) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "NEX Financial Advisor",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API xatosi: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Javob olinmadi";
}

// ─── INIT (server ishga tushganda avtomatik) ───────────
export function initGemini(apiKey) {
  // OpenRouter uchun alohida init kerak emas — API_KEY kodda
  isReady = true;
  return true;
}

export function getModel() {
  // Compatibility uchun saqlab qo'yildi
  if (!isReady) {
    throw new Error("API kaliti kiritilmagan.");
  }
  return { generateContent: async (prompt) => {
    const reply = await chatRequest([{ role: "user", content: prompt }]);
    return { response: { text: () => reply } };
  }};
}

// ─── Server ishga tushganda avtomatik ulash ────────────
isReady = true;
console.log("✅ OpenRouter API kaliti tayyor (avtomatik ulangan)");

// ─── SYSTEM CONTEXT ────────────────────────────────────
const SYSTEM_CONTEXT = `Siz "NEX" moliyaviy AI yordamchisisiz. O'zbekistondagi kichik biznes egalari uchun ishlaysiz.

Qoidalar:
1. Har doim foydalanuvchi tilida javob bering (o'zbek yoki rus)
2. ANIQ va AMALIY maslahat bering — mavhum gaplar yo'q
3. Oddiy til ishlating — egasi moliyachilik bilmaydi
4. Nima uchun tavsiya berayotganingizni tushuntiring
5. Xavf ko'rsangiz — to'g'ridan-to'g'ri ayting
6. Yaxshi ko'rsatkichlarda ham keyingi qadamni tavsiya qiling
7. Javoblarni qisqa va aniq qiling (maksimal 3-4 paragraf)
8. So'm miqdorlarini o'qilishi qulay formatda ko'rsating (masalan: 45.5 mln so'm)`;

// ─── AI ADVICE ─────────────────────────────────────────
export async function getAIAdvice(userMessage, businessData) {
  const context = `
Biznes ma'lumotlari:
- Biznes nomi: ${businessData.businessName}
- Turi: ${businessData.businessType}
- So'nggi oy daromadi: ${formatAmount(businessData.lastMonthIncome)} so'm
- So'nggi oy xarajati: ${formatAmount(businessData.lastMonthExpense)} so'm
- So'nggi oy foydasi: ${formatAmount(businessData.lastMonthProfit)} so'm
- Biznes salomatligi: ${businessData.healthScore}/100 (${businessData.healthStatus})
- O'sish trendi: ${businessData.growthTrend}%
- Faol ogohlantirishlar: ${businessData.alerts.join(", ")}

Foydalanuvchi savoli: ${userMessage}`;

  try {
    return await chatRequest([
      { role: "system", content: SYSTEM_CONTEXT },
      { role: "user", content: context },
    ]);
  } catch (error) {
    if (error.message?.includes("401") || error.message?.includes("invalid")) {
      throw new Error("API kalit noto'g'ri. Iltimos, to'g'ri API kalitini kiriting.");
    }
    throw new Error("AI javob berishda xatolik yuz berdi. Qaytadan urinib ko'ring.");
  }
}

// ─── SCENARIO ANALYSIS ────────────────────────────────
export async function analyzeScenario(scenario, businessData) {
  const prompt = `
Biznes: ${businessData.businessName} (${businessData.businessType})
Oylik daromad: ~${formatAmount(businessData.lastMonthIncome)} so'm
Oylik xarajat: ~${formatAmount(businessData.lastMonthExpense)} so'm
Sog'liq balli: ${businessData.healthScore}/100

Stsenariy tahlili so'raldi: "${scenario}"

Quyidagi formatda javob bering:
1. Stsenariyning mumkin bo'lgan ta'siri (ijobiy va salbiy)
2. Moliyaviy hisob-kitob (taxminiy raqamlar bilan)
3. Xavf darajasi (past/o'rta/yuqori)
4. Tavsiya (qilish kerakmi yoki yo'q, nima uchun)
5. Agar qilsa, qanday bosqichda amalga oshirish kerak`;

  return await chatRequest([
    { role: "system", content: SYSTEM_CONTEXT },
    { role: "user", content: prompt },
  ]);
}

// ─── EXPANSION ANALYSIS ───────────────────────────────
export async function getExpansionAnalysis(businessData) {
  const prompt = `
Biznes: ${businessData.businessName}
Oylik o'rtacha daromad: ${formatAmount(businessData.avgIncome)} so'm
Oylik o'rtacha foyda: ${formatAmount(businessData.avgProfit)} so'm
Sog'liq balli: ${businessData.healthScore}/100
O'sish trendi: ${businessData.growthTrend}%

Ushbu biznesning kengayishga tayyorligini baholang:
1. Kengayishga tayyor yoki yo'q (aniq javob)
2. Asosiy sabablar (3 ta)
3. Qanday qadamlar qo'yish kerak
4. Optimal vaqt qachon
5. Kredit yoki o'z mablag'imi?`;

  return await chatRequest([
    { role: "system", content: SYSTEM_CONTEXT },
    { role: "user", content: prompt },
  ]);
}

// ─── HELPERS ───────────────────────────────────────────
function formatAmount(amount) {
  if (!amount) return "0";
  if (amount >= 1000000) return (amount / 1000000).toFixed(1) + " mln";
  if (amount >= 1000) return (amount / 1000).toFixed(0) + " ming";
  return amount.toString();
}
