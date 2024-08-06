const dotenv = require('dotenv');

dotenv.config();

const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
};

export default config;
