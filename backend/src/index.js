// src/index.js
import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api", apiRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "NEX Backend", version: "1.0.0" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server xatosi:", err);
  res.status(500).json({ error: "Server ichki xatosi yuz berdi" });
});

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════╗
  ║   NEX Backend — Port ${PORT}    ║
  ║   AI Moliyaviy Yordamchi      ║
  ╚═══════════════════════════════╝
  `);
});
