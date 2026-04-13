# NEX — AI Moliyaviy Yordamchi

> Kichik biznes uchun AI asosidagi moliyaviy maslahatchi. Daromadni kuzatish, xarajatni tahlil qilish, kelajakni bashorat qilish va AI maslahat olish — hammasi bir joyda.

---

## Texnologiyalar

| Qism | Texnologiya |
|------|------------|
| Backend | Node.js + Express |
| AI | Google Gemini 1.5 Flash |
| Frontend | React 18 + Recharts |
| Ma'lumot | In-memory (demo) |

---

## O'rnatish

### Talablar
- Node.js 18+
- npm yoki yarn
- Gemini API kaliti (https://aistudio.google.com/app/apikey)

---

### 1. Backend

```bash
cd backend
npm install
npm start
```

Server `http://localhost:5000` da ishga tushadi.

---

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Dastur `http://localhost:3000` da ochiladi.

---

## Gemini API Kaliti

1. https://aistudio.google.com/app/apikey sahifasiga kiring
2. "Create API Key" tugmasini bosing
3. Dasturni oching → "AI Maslahat" sahifasiga o'ting
4. API kalitingizni kiriting va "Ulash" tugmasini bosing

---

## Sahifalar

| Sahifa | Tavsif |
|--------|--------|
| **Dashboard** | Umumiy ko'rinish, sog'liq balli, grafik |
| **Tahlil** | Xarajat/daromad tuzilmasi, kategoriyalar |
| **Bashorat** | 6 oylik daromad prognoxi |
| **AI Maslahat** | Gemini bilan chat, moliyaviy savollar |
| **Stsenariy** | "Nima bo'lsa nima bo'ladi?" tahlili |
| **Tranzaksiyalar** | Barcha kirim/chiqimlar ro'yxati |

---

## API Endpointlar

```
GET  /api/dashboard          - Umumiy ma'lumot
GET  /api/transactions       - Tranzaksiyalar ro'yxati
POST /api/transactions       - Yangi tranzaksiya
GET  /api/analytics/monthly  - Oylik tahlil
GET  /api/analytics/categories - Kategoriyalar
GET  /api/analytics/health   - Sog'liq balli
GET  /api/forecast           - Bashorat ma'lumotlari
GET  /api/alerts             - Ogohlantirishlar
POST /api/ai/chat            - AI maslahat
POST /api/ai/scenario        - Stsenariy tahlili
GET  /api/ai/expansion       - Kengayish tayyorligi
POST /api/settings/api-key   - API kalit sozlash
```

---

## Loyiha Strukturasi

```
nex/
├── backend/
│   ├── src/
│   │   ├── index.js              # Server
│   │   ├── routes/api.js         # Barcha API routelar
│   │   ├── services/geminiService.js  # AI integratsiya
│   │   └── data/seedData.js      # Demo ma'lumotlar
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.js                # Asosiy komponent
    │   ├── index.css             # Design system
    │   ├── lib/api.js            # API client
    │   ├── components/
    │   │   ├── layout/Sidebar.jsx
    │   │   └── charts/HealthGauge.jsx
    │   └── pages/
    │       ├── Dashboard.jsx
    │       ├── Analytics.jsx
    │       ├── Forecast.jsx
    │       ├── Advisor.jsx
    │       ├── Scenarios.jsx
    │       └── Transactions.jsx
    └── package.json
```

---

**NEX** — Biznesingiz kelajagini bugun ko'ring.
