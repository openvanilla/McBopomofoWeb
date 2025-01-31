module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  reporters: ["default", "jest-junit"],
  coverageReporters: ["json", "html",  "clover", " json-summary"],
};