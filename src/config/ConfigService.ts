import { z } from "zod";
import dotenvFlow from "dotenv-flow";
import * as path from "node:path";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  DB_HOST: z.string().default("postgres"),
  DB_USER: z.string().default("postgres"),
  DB_PASSWORD: z.string().default("postgres"),
  DB_NAME: z.string().default("postgres"),
  DB_MAX_RETRIES: z.coerce.number().optional().default(5),
  DB_RETRY_DELAY: z.coerce.number().optional().default(1000),
  SERVER_SHUTDOWN_TIMEOUT: z.coerce.number().default(30000),
  APP_SESSION_SECRET: z.string().default("app-session-secret"),
  APP_SESSION_COOKIE_MAX_AGE: z.coerce.number().default(300000),
  REDIS_HOST: z.string().default("redis"),
  REDIS_PORT: z.coerce.number().default(6379),
  APP_SESSION_REDIS_PASSWORD: z.string().optional().default(""),
  APP_SESSION_REDIS_PREFIX: z.string().default("session:"),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  ANALYTICS_ENABLED: z.string().optional(),
  ANALYTICS_URL: z.string().optional().default(""),
  ANALYTICS_LOG_LEVEL: z.string().optional().default("info"),
  LOG_FILE_PATH: z.string().optional().default("app-%DATE%.log"),
  LOG_LEVEL: z.string().optional().default("info"),
  POSTGRES_HOST: z.string().default("postgres"),
  POSTGRES_USER: z.string().default("postgres"),
  POSTGRES_PASSWORD: z.string().default("postgres"),
  POSTGRES_DB: z.string().default("postgres"),
});

export type Env = z.infer<typeof envSchema>;

export class ConfigService {
  private static env: Env;

  static load() {
    dotenvFlow.config({ path: path.resolve(__dirname, "../../") });
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error("\u274c Invalid environment variables:", result.error.format());
      process.exit(1);
    }
    ConfigService.env = result.data;
  }

  static get values(): Env {
    return ConfigService.env;
  }

  static get nodeEnv() {
    return ConfigService.env.NODE_ENV;
  }
  static get port() {
    return ConfigService.env.PORT;
  }
  static get databaseUrl() {
    return ConfigService.env.DATABASE_URL;
  }
  static get redisUrl() {
    return ConfigService.env.REDIS_URL;
  }
  static get jwtSecret() {
    return ConfigService.env.JWT_SECRET;
  }

  static get db() {
    return {
      host: ConfigService.env.DB_HOST,
      user: ConfigService.env.DB_USER,
      password: ConfigService.env.DB_PASSWORD,
      name: ConfigService.env.DB_NAME,
      maxRetries: ConfigService.env.DB_MAX_RETRIES,
      retryDelay: ConfigService.env.DB_RETRY_DELAY,
    };
  }

  static get server() {
    return {
      port: ConfigService.env.PORT,
      environment: ConfigService.env.NODE_ENV,
      shutdownTimeout: ConfigService.env.SERVER_SHUTDOWN_TIMEOUT,
    };
  }

  static get app() {
    return {
      session: {
        secret: ConfigService.env.APP_SESSION_SECRET,
        cookie: {
          maxAge: ConfigService.env.APP_SESSION_COOKIE_MAX_AGE,
        },
        redis: {
          host: ConfigService.env.REDIS_HOST,
          port: ConfigService.env.REDIS_PORT,
          password: ConfigService.env.APP_SESSION_REDIS_PASSWORD,
          prefix: ConfigService.env.APP_SESSION_REDIS_PREFIX,
        },
      },
      mail: {
        host: ConfigService.env.SMTP_HOST,
        port: ConfigService.env.SMTP_PORT,
        user: ConfigService.env.SMTP_USER,
        pass: ConfigService.env.SMTP_PASS,
      },
      defaultRoleName: "User",
    };
  }

  static get analytics() {
    return {
      enabled: ConfigService.env.ANALYTICS_ENABLED === "true",
      url: ConfigService.env.ANALYTICS_URL,
      logLevel: ConfigService.env.ANALYTICS_LOG_LEVEL,
    };
  }

  static get knex() {
    return {
      host: ConfigService.env.POSTGRES_HOST,
      user: ConfigService.env.POSTGRES_USER,
      password: ConfigService.env.POSTGRES_PASSWORD,
      database: ConfigService.env.POSTGRES_DB,
    };
  }
}

export default ConfigService;

// Load configuration immediately when this module is imported
ConfigService.load();
