const StellarSdk = require("@stellar/stellar-sdk");
const axios = require("axios");

// Configure Stellar SDK for testnet
console.log("Stellar Service initializing with:", {
  HORIZON_URL: process.env.HORIZON_URL,
  STELLAR_NETWORK: process.env.STELLAR_NETWORK,
});

const server = new StellarSdk.Horizon.Server(
  process.env.HORIZON_URL || "https://horizon-testnet.stellar.org"
);

class StellarService {
  // Create a new Stellar account
  async createAccount() {
    const keypair = StellarSdk.Keypair.random();

    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }

  // Fund account using friendbot (testnet only)
  async fundAccount(publicKey) {
    if (process.env.STELLAR_NETWORK !== "testnet") {
      throw new Error("Account funding is only available on testnet");
    }

    try {
      const response = await axios.get(
        `${process.env.FRIENDBOT_URL}?addr=${publicKey}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fund account: ${error.message}`);
    }
  }

  // Get account balance
  async getAccountBalance(publicKey) {
    try {
      const account = await server.loadAccount(publicKey);

      const balances = account.balances.map((balance) => ({
        asset_type: balance.asset_type,
        asset_code: balance.asset_code || "XLM",
        balance: balance.balance,
        buying_liabilities: balance.buying_liabilities,
        selling_liabilities: balance.selling_liabilities,
      }));

      return {
        accountId: account.accountId(),
        sequence: account.sequenceNumber(),
        balances,
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error("Account not found. Make sure the account is funded.");
      }
      throw new Error(`Failed to load account: ${error.message}`);
    }
  }

  // Send payment
  async sendPayment(senderSecret, recipientPublic, amount, memo = "") {
    try {
      // Load sender account
      const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecret);
      const senderAccount = await server.loadAccount(senderKeypair.publicKey());

      // Build transaction
      const transaction = new StellarSdk.TransactionBuilder(senderAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: recipientPublic,
            asset: StellarSdk.Asset.native(),
            amount: amount.toString(),
          })
        )
        .setTimeout(180);

      // Add memo if provided
      if (memo) {
        transaction.addMemo(StellarSdk.Memo.text(memo));
      }

      const builtTransaction = transaction.build();
      builtTransaction.sign(senderKeypair);

      // Submit transaction
      const result = await server.submitTransaction(builtTransaction);

      return {
        hash: result.hash,
        ledger: result.ledger,
        successful: result.successful,
        fee_charged: result.fee_charged,
        max_fee: result.max_fee,
      };
    } catch (error) {
      if (error.response && error.response.data && error.response.data.extras) {
        throw new Error(
          `Transaction failed: ${error.response.data.extras.result_codes.transaction}`
        );
      }
      throw new Error(`Failed to send payment: ${error.message}`);
    }
  }

  // Get transaction history
  async getTransactionHistory(publicKey, limit = 10) {
    try {
      const transactions = await server
        .transactions()
        .forAccount(publicKey)
        .limit(Number(limit))
        .order("desc")
        .call();

      return transactions.records.map((tx) => ({
        id: tx.id,
        hash: tx.hash,
        ledger: tx.ledger,
        created_at: tx.created_at,
        source_account: tx.source_account,
        fee_charged: tx.fee_charged,
        max_fee: tx.max_fee,
        operation_count: tx.operation_count,
        memo_type: tx.memo_type,
        memo: tx.memo,
        successful: tx.successful,
      }));
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }
  }

  // Validate Stellar address
  isValidAddress(address) {
    try {
      StellarSdk.Keypair.fromPublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get network info
  getNetworkInfo() {
    return {
      network: process.env.STELLAR_NETWORK,
      horizon_url: process.env.HORIZON_URL,
      friendbot_url: process.env.FRIENDBOT_URL,
    };
  }
}

module.exports = new StellarService();
