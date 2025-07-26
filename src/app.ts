import express from "express";
import { getSessionMiddleware } from "@config/sessionConfig";
import setupSwagger from "@config/swagger";
import * as path from "node:path";
import LoggerFactory from "@utils/Logger";

import * as middlewares from "./middlewares";
import { api_v1 } from "./api/v1/";
import { healthRouter } from "./health";
import { render } from "./ui/entry-server";

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

const ssrPaths = ["/", "/login", "/admin"];

app.get("*", async (req, res, next) => {
  try {
    if (!ssrPaths.some((p) => req.path.startsWith(p))) {
      return next(); // unknown path → routeNotFound
    }

    const htmlContent = await render(req.url);
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="stylesheet" href="/public/styles.css" />
          <title>Admin UI</title>
        </head>
        <body>
          <div id="root">${htmlContent}</div>
          <script type="module" src="/static/entry-client.js"></script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("SSR rendering error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.use(middlewares.errorHandler);
app.use(middlewares.routeNotFound);

export default app;
