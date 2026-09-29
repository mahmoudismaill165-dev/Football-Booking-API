/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest/presets/default-esm",

  testEnvironment: "node",

  extensionsToTreatAsEsm: [".ts"],

  testMatch: ["**/tests/**/*.test.ts"],

  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  testTimeout: 30000,
};

export default config;
