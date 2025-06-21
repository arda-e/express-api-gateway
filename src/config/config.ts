import ConfigService from "./ConfigService";

const config = {
  db: ConfigService.db,
  server: ConfigService.server,
  app: ConfigService.app,
  analytics: ConfigService.analytics,
};

export default config;
