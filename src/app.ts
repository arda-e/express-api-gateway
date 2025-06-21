import express from "express";
import { getSessionMiddleware } from "@config/sessionConfig";
import setupSwagger from "@config/swagger";
import * as path from "node:path";
import LoggerFactory from "@utils/Logger";

import * as middlewares from "./middlewares";
import { api_v1 } from "./api/v1/";
import { healthRouter } from "./health";

const app = express();
const logger = LoggerFactory.getLogger();

app.use(express.json());
app.use(middlewares.logger);

// Mount health routes before other middleware
app.use(healthRouter);

app.use(getSessionMiddleware());
setupSwagger(app);

const publicPath = path.join(__dirname, "./ui/public");
const staticFolder = path.join(__dirname, "../dist/client");
logger.info(`Serving public assets from: ${publicPath}`);
logger.info(`Serving static files from: ${staticFolder}`);

app.use("/public", express.static(publicPath));
app.use("/static", express.static(staticFolder));

app.get("/", (req, res) => {
  res.status(200).json("Welcome to the API Gateway!");
});

app.use("/api/v1", api_v1);
app.use(middlewares.errorHandler);
app.use(middlewares.routeNotFound);

export default app;
