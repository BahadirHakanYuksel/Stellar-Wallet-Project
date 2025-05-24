require("dotenv").config();

describe("Stellar Wallet API Integration Tests", () => {
  let testAccount;

  test("should create new account", async () => {
    const stellarService = require("../services/stellarService");

    const account = await stellarService.createAccount();
    expect(account).toHaveProperty("publicKey");
    expect(account).toHaveProperty("secretKey");

    testAccount = account;
  }, 10000);

  test("should validate stellar addresses", () => {
    const stellarService = require("../services/stellarService");

    expect(stellarService.isValidAddress(testAccount.publicKey)).toBe(true);
    expect(stellarService.isValidAddress("invalid-key")).toBe(false);
  });

  test("should return network info", () => {
    const stellarService = require("../services/stellarService");

    const networkInfo = stellarService.getNetworkInfo();
    expect(networkInfo).toHaveProperty("network");
    expect(networkInfo.network).toBe("testnet");
  });
});
