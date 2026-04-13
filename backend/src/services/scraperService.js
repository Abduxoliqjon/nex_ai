// src/services/scraperService.js
import puppeteer from "puppeteer";

const OPENROUTER_KEY = "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";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.0-flash-001";

// ─── DETECT SOURCE ─────────────────────────────────────
function detectSource(url) {
  if (url.includes("2gis")) return "2gis";
  if (url.includes("google.com/maps") || url.includes("goo.gl/maps") || url.includes("maps.app.goo.gl")) return "google";
  return null;
}

// ─── SCRAPE GOOGLE MAPS ────────────────────────────────
async function scrapeGoogle(url, browser) {
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36");
  await page.setViewport({ width: 1280, height: 900 });

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForSelector('div[role="main"]', { timeout: 10000 });

    // Restoran nomi
    const name = await page.$eval('div[role="main"] h1', el => el.textContent?.trim()).catch(() => null);

    // Overall rating
    const ratingText = await page.$eval('div[role="main"] span[aria-hidden="true"]', el => el.textContent?.trim()).catch(() => null);
    const rating = ratingText ? parseFloat(ratingText.replace(",", ".")) : null;

    // Review count
    const reviewCountText = await page.$$eval('div[role="main"] button[jsaction]', els => {
      for (const el of els) {
        const t = el.textContent || "";
        const match = t.match(/([\d\s,.]+)\s*(отзыв|review|sharh|ta\b)/i);
        if (match) return match[1].replace(/\s/g, "");
      }
      return null;
    }).catch(() => null);
    const totalReviews = reviewCountText ? parseInt(reviewCountText.replace(/\D/g, "")) : null;

    // Sharhlar tab ga bosish
    const reviewTab = await page.$('button[aria-label*="review"], button[aria-label*="отзыв"], button[data-tab-index="1"]');
    if (reviewTab) {
      await reviewTab.click();
      await new Promise(r => setTimeout(r, 2000));
    }

    // Scroll qilish — ko'proq sharhlar yuklash
    const scrollable = await page.$('div[role="main"]');
    if (scrollable) {
      for (let i = 0; i < 5; i++) {
        await page.evaluate(sel => {
          const container = document.querySelector('div.m6QErb.DxyBCb.kA9KIf.dS8AEf');
          if (container) container.scrollTop = container.scrollHeight;
        });
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    // Sharhlarni olish
    const reviews = await page.$$eval('div[data-review-id]', elements => {
      return elements.slice(0, 30).map(el => {
        const authorEl = el.querySelector('div.d4r55, button[data-review-id] div.d4r55, .WNxzHc a');
        const author = authorEl?.textContent?.trim() || "Anonim";

        const starsEl = el.querySelector('span[role="img"]');
        const starsLabel = starsEl?.getAttribute('aria-label') || "";
        const starsMatch = starsLabel.match(/(\d)/);
        const stars = starsMatch ? parseInt(starsMatch[1]) : null;

        const textEl = el.querySelector('span.wiI7pd');
        const text = textEl?.textContent?.trim() || "";

        const dateEl = el.querySelector('span.rsqaWe');
        const date = dateEl?.textContent?.trim() || "";

        return { author, stars, text, date };
      }).filter(r => r.text || r.stars);
    }).catch(() => []);

    // Kategoriya/Turi
    const category = await page.$eval('div[role="main"] button[jsaction*="category"]', el => el.textContent?.trim()).catch(() =>
      page.$eval('div[role="main"] span.DkEaL', el => el.textContent?.trim()).catch(() => null)
    );

    // Address
    const address = await page.$eval('button[data-item-id="address"] div.Io6YTe, div.rogA2c div.Io6YTe', el => el.textContent?.trim()).catch(() => null);

    return {
      name: name || "Nomi topilmadi",
      rating,
      totalReviews,
      category,
      address,
      reviews,
      source: "google",
    };
  } finally {
    await page.close();
  }
}

// ─── SCRAPE 2GIS ───────────────────────────────────────
async function scrape2GIS(url, browser) {
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36");
  await page.setViewport({ width: 1280, height: 900 });

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    // Restoran nomi
    const name = await page.$eval('h1._1blag, h1._fjf78', el => el.textContent?.trim()).catch(() =>
      page.$eval('div._oqoid span', el => el.textContent?.trim()).catch(() => null)
    );

    // Rating
    const ratingText = await page.$eval('div._y10azs span, div._jspzdm', el => el.textContent?.trim()).catch(() => null);
    const rating = ratingText ? parseFloat(ratingText.replace(",", ".")) : null;

    // Review count
    const reviewCountText = await page.$$eval('a, span, div', els => {
      for (const el of els) {
        const t = el.textContent || "";
        const match = t.match(/([\d]+)\s*(отзыв|шарҳ|review)/i);
        if (match) return match[1];
      }
      return null;
    }).catch(() => null);
    const totalReviews = reviewCountText ? parseInt(reviewCountText) : null;

    // "Отзывы" tab ga bosish
    const reviewsTabSelector = 'a[href*="tab/reviews"], a._1a7dkp, div[data-name="Tabs"] a';
    const tabs = await page.$$(reviewsTabSelector);
    for (const tab of tabs) {
      const tabText = await tab.evaluate(el => el.textContent || "");
      if (tabText.match(/(отзыв|review|sharh)/i)) {
        await tab.click();
        await new Promise(r => setTimeout(r, 3000));
        break;
      }
    }

    // Scroll qilish
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        const panel = document.querySelector('div._1gbkco, div._1ihrpgr, div._1x0hap');
        if (panel) panel.scrollTop = panel.scrollHeight;
        else window.scrollTo(0, document.body.scrollHeight);
      });
      await new Promise(r => setTimeout(r, 1500));
    }

    // Sharhlar
    const reviews = await page.evaluate(() => {
      const results = [];
      // 2GIS review containers
      const reviewEls = document.querySelectorAll('div._11gvlm, div._49x36f, div[class*="review"]');

      reviewEls.forEach(el => {
        const author = el.querySelector('div._16s5yj, span._1bvks6, a._16s5yj')?.textContent?.trim() || "Anonim";

        // Stars — 2GIS uses filled star icons
        const filledStars = el.querySelectorAll('span._1fkin5c._1gmehi3, svg[class*="star"][fill], span._1lczmo3');
        let stars = filledStars.length || null;

        // Alt way: rating text
        if (!stars) {
          const ratingEl = el.querySelector('div._1fkin5c');
          if (ratingEl) {
            const rMatch = ratingEl.textContent.match(/(\d)/);
            stars = rMatch ? parseInt(rMatch[1]) : null;
          }
        }

        const text = el.querySelector('div._4mwq3d, div._49x36f a + div, div[class*="text"]')?.textContent?.trim() || "";
        const date = el.querySelector('div._4s1oud, span._18jampt, div[class*="date"]')?.textContent?.trim() || "";

        if (text || stars) results.push({ author, stars, text, date });
      });

      return results.slice(0, 30);
    }).catch(() => []);

    // Manzil
    const address = await page.$eval('div._49kxlr, div._er2xx9', el => el.textContent?.trim()).catch(() => null);

    // Kategoriya
    const category = await page.$eval('div._oqoid div._1p8iqzw, a._1rehek', el => el.textContent?.trim()).catch(() => null);

    return {
      name: name || "Nomi topilmadi",
      rating,
      totalReviews,
      category,
      address,
      reviews,
      source: "2gis",
    };
  } finally {
    await page.close();
  }
}

// ─── MAIN SCRAPER ──────────────────────────────────────
export async function scrapeReviews(url) {
  const source = detectSource(url);

  if (!source) {
    throw new Error("Faqat Google Maps yoki 2GIS linklari qo'llab-quvvatlanadi");
  }

  console.log(`🔍 Scraping ${source}: ${url}`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1280,900",
    ],
  });

  try {
    let data;
    if (source === "google") {
      data = await scrapeGoogle(url, browser);
    } else {
      data = await scrape2GIS(url, browser);
    }

    console.log(`✅ Scraped: ${data.name} — ${data.reviews.length} reviews`);
    return data;
  } finally {
    await browser.close();
  }
}

// ─── AI REVIEW ANALYSIS ────────────────────────────────
export async function analyzeReviews(scrapedData) {
  const reviewTexts = scrapedData.reviews
    .filter(r => r.text)
    .map((r, i) => `${i + 1}. [${r.stars || "?"}⭐] ${r.author}: "${r.text}"`)
    .join("\n");

  const starsDistribution = [5, 4, 3, 2, 1].map(s => {
    const count = scrapedData.reviews.filter(r => r.stars === s).length;
    return `${s}⭐: ${count} ta`;
  }).join(", ");

  const prompt = `Sen restoran tahlil qiluvchi AI ekspertisan. Quyidagi restoran sharhlarini tahlil qil va FAQAT JSON formatda javob ber (boshqa hech narsa yozma):

RESTORAN: ${scrapedData.name}
UMUMIY REYTING: ${scrapedData.rating || "N/A"}
JAMI SHARHLAR: ${scrapedData.totalReviews || scrapedData.reviews.length}
YULDUZ TAQSIMOTI: ${starsDistribution}

SHARHLAR:
${reviewTexts || "Sharhlar topilmadi"}

Quyidagi JSON formatda javob ber:
{
  "overallSentiment": "ijobiy/salbiy/aralash",
  "sentimentScore": 0-100,
  "strengths": ["kuchli tomon 1", "kuchli tomon 2", "kuchli tomon 3"],
  "weaknesses": ["zaif tomon 1", "zaif tomon 2"],
  "categories": {
    "taom_sifati": { "score": 0-100, "summary": "qisqa izoh" },
    "xizmat_sifati": { "score": 0-100, "summary": "qisqa izoh" },
    "atmosfera": { "score": 0-100, "summary": "qisqa izoh" },
    "narx_arzirligi": { "score": 0-100, "summary": "qisqa izoh" },
    "tozalik": { "score": 0-100, "summary": "qisqa izoh" }
  },
  "topPositiveThemes": ["tema 1", "tema 2", "tema 3"],
  "topNegativeThemes": ["tema 1", "tema 2"],
  "recommendation": "umumiy tavsiya 2-3 gapda",
  "competitorAdvice": "raqobatchilar uchun maslahat 1-2 gap"
}`;

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_KEY}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "NEX Review Analyzer",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: "Sen restoran sharhlarini tahlil qiluvchi AI ekspertisan. Faqat JSON formatda javob ber. Hech qanday markdown yoki boshqa matn qo'shma." },
        { role: "user", content: prompt },
      ],
      max_tokens: 2048,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `AI xatosi: ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";

  // JSON ni ajratib olish
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI javobidan JSON ajratib bo'lmadi");
  }

  return JSON.parse(jsonMatch[0]);
}
