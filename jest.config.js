module.exports = {
  testEnvironment: "node",
  testTimeout: 30000,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  collectCoverageFrom: [
    "services/**/*.js",
    "routes/**/*.js",
    "!**/node_modules/**",
  ],
  testMatch: ["**/tests/**/*.test.js"],
};
