require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const stellarRoutes = require("./routes/stellar");

const app = express();
const PORT = process.env.PORT || 3000;

// Environment check for debugging
console.log("Server starting with env:", {
  NODE_ENV: process.env.NODE_ENV,
  STELLAR_NETWORK: process.env.STELLAR_NETWORK,
  HORIZON_URL: process.env.HORIZON_URL,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/stellar", stellarRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      STELLAR_NETWORK: process.env.STELLAR_NETWORK,
      HORIZON_URL: process.env.HORIZON_URL,
    },
  });
});

// Serve main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error occurred:", err.stack);
  console.error("Error message:", err.message);
  console.error("Request URL:", req.url);
  console.error("Request method:", req.method);

  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
    url: req.url,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Stellar Wallet Server running on http://localhost:${PORT}`);
  console.log(`📡 Connected to Stellar ${process.env.STELLAR_NETWORK} network`);
});

module.exports = app;
