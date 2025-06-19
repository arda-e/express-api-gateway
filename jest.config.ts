module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@api/(.*)$": "<rootDir>/src/api/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@db/(.*)$": "<rootDir>/src/db/$1",
    "^@middlewares(.*)$": "<rootDir>/src/middlewares$1",
  },
  globals: {
    "ts-jest": {
      diagnostics: false,
    },
  },
};
