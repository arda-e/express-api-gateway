import type { Knex } from "knex";
const dotenv = require("dotenv");

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB
    },
    migrations: {
      directory: '../migrations',
      extension: 'ts',
    },
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB
    },
    migrations: {
      directory: './dist/migrations',
      extension: 'js',
    },
  },
};

export default config