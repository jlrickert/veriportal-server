module.exports = {
  globals: {
    "ts-jest": {
      tsConfigFile: "./tsconfig.test.json"
    }
  },
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.(ts|tsx)$": "./node_modules/ts-jest/preprocessor.js"
  },
  testMatch: ["**/__tests__/**/*.test.(ts|js)", "**/*.test.(ts|js)"],
  testEnvironment: "node"
};
