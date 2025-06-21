import type { Knex } from "knex";

import ConfigService from "./ConfigService";

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: ConfigService.knex,
    migrations: {
      directory: "../migrations",
      extension: "ts",
    },
    seeds: {
      directory: "../seeds",
      extension: "ts",
    },
  },
  production: {
    client: "pg",
    connection: ConfigService.knex,
    migrations: {
      directory: "./dist/migrations",
      extension: "js",
    },
    seeds: {
      directory: "../seeds",
      extension: "ts",
    },
  },
};

export default knexConfig;
