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
  testTimeout: 30000,
  injectGlobals: true,
  // JUnit reporter for Jenkins
  reporters: [
    "default",
    ["jest-junit", {
      outputDirectory: "backend/test-results",
      outputName: "junit.xml",
      classNameTemplate: "{classname}",
      titleTemplate: "{title}",
      ancestorSeparator: " › ",
      usePathForSuiteName: true,
    }]
  ],
};

export default config;
