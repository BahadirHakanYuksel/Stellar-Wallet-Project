const express = require("express");
const router = express.Router();
const stellarService = require("../services/stellarService");

// Create new account
router.post("/account/create", async (req, res) => {
  try {
    const account = await stellarService.createAccount();
    res.json({
      success: true,
      account: {
        publicKey: account.publicKey,
        secretKey: account.secretKey,
      },
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Fund account (testnet only)
router.post("/account/fund", async (req, res) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({
        success: false,
        error: "Public key is required",
      });
    }

    const result = await stellarService.fundAccount(publicKey);
    res.json({
      success: true,
      message: "Account funded successfully",
      result,
    });
  } catch (error) {
    console.error("Error funding account:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get account balance
router.get("/account/:publicKey/balance", async (req, res) => {
  try {
    const { publicKey } = req.params;
    const balance = await stellarService.getAccountBalance(publicKey);

    res.json({
      success: true,
      balance,
    });
  } catch (error) {
    console.error("Error getting balance:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Send payment
router.post("/payment/send", async (req, res) => {
  try {
    const { senderSecret, recipientPublic, amount, memo } = req.body;

    if (!senderSecret || !recipientPublic || !amount) {
      return res.status(400).json({
        success: false,
        error: "Sender secret, recipient public key, and amount are required",
      });
    }

    const result = await stellarService.sendPayment(
      senderSecret,
      recipientPublic,
      amount,
      memo
    );

    res.json({
      success: true,
      transaction: result,
      message: "Payment sent successfully",
    });
  } catch (error) {
    console.error("Error sending payment:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get transaction history
router.get("/account/:publicKey/transactions", async (req, res) => {
  try {
    const { publicKey } = req.params;
    const { limit = 10 } = req.query;

    const transactions = await stellarService.getTransactionHistory(
      publicKey,
      limit
    );

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Error getting transactions:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
