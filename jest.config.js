/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  transform: {},
  moduleFileExtensions: ["js", "mjs", "json"],
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "backend/**/*.js",
    "!backend/app.js",
    "!backend/seeder/**",
  ],
  coverageDirectory: "coverage",
  verbose: true,
  transformIgnorePatterns: [],
};

export default config;
