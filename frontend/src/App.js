// src/App.js
import React, { useState, useEffect } from "react";
import "./index.css";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Forecast from "./pages/Forecast";
import Advisor from "./pages/Advisor";
import Scenarios from "./pages/Scenarios";
import Transactions from "./pages/Transactions";
import Reviews from "./pages/Reviews";
import { api } from "./lib/api";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [apiKeySet, setApiKeySet] = useState(false);

  useEffect(() => {
    api.getStatus().then(s => setApiKeySet(s.apiKeySet)).catch(() => {});
  }, []);

  async function handleSetApiKey(key) {
    await api.setApiKey(key);
    setApiKeySet(true);
  }

  const pages = {
    dashboard: <Dashboard onNavigate={setPage} />,
    analytics: <Analytics />,
    forecast: <Forecast />,
    advisor: <Advisor apiKeySet={apiKeySet} onSetApiKey={handleSetApiKey} />,
    scenarios: <Scenarios apiKeySet={apiKeySet} />,
    transactions: <Transactions />,
    reviews: <Reviews />,
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={page} onNavigate={setPage} apiKeySet={apiKeySet} />
      <main className="main-content">
        {pages[page] || pages.dashboard}
      </main>
    </div>
  );
}
