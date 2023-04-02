/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "collectCoverageFrom": ["./src/**/*.ts"],
  "collectCoverage": true,
  "coverageProvider": 'v8',
  roots: ['./tests', './src'],
  coverageReporters: ['json-summary', 'text', 'html-spa', 'lcov'],
  reporters: ['default', './build/tests/jest_reporter.js'],
};
// 'text', 'json', 'text-summary', 