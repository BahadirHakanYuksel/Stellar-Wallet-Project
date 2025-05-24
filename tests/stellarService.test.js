require("dotenv").config();
const stellarService = require("../services/stellarService");

describe("Stellar Service", () => {
  test("should create a new account with public and secret keys", async () => {
    const account = await stellarService.createAccount();

    expect(account).toHaveProperty("publicKey");
    expect(account).toHaveProperty("secretKey");
    expect(account.publicKey).toMatch(/^G[A-Z2-7]{55}$/);
    expect(account.secretKey).toMatch(/^S[A-Z2-7]{55}$/);
  });

  test("should validate valid Stellar address", () => {
    const validAddress =
      "GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU";
    expect(stellarService.isValidAddress(validAddress)).toBe(true);
  });

  test("should reject invalid Stellar address", () => {
    const invalidAddress = "invalid-address";
    expect(stellarService.isValidAddress(invalidAddress)).toBe(false);
  });

  test("should return network info", () => {
    const networkInfo = stellarService.getNetworkInfo();

    expect(networkInfo).toHaveProperty("network");
    expect(networkInfo).toHaveProperty("horizon_url");
    expect(networkInfo).toHaveProperty("friendbot_url");
  });
});
