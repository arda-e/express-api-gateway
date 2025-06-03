import express from "express";
import { getSessionMiddleware } from "@config/sessionConfig";
import setupSwagger from "@config/swagger";
import * as path from "node:path";

import * as middlewares from "./middlewares";
import { api_v1 } from "./api/v1/";

const app = express();

app.use(express.json());
app.use(middlewares.logger);

app.use(getSessionMiddleware());
setupSwagger(app);

const publicPath = path.join(__dirname, "./ui/public");
const staticFolder = path.join(__dirname, "../dist/client");
console.log("Serving public assets from:", publicPath);
console.log("Serving static files from:", staticFolder);

app.use("/public", express.static(publicPath));
app.use("/static", express.static(staticFolder));

app.get("/", (req, res) => {
  res.status(200).json("Welcome to the API Gateway!");
});

app.use("/api/v1", api_v1);
app.use(middlewares.errorHandler);
app.use(middlewares.routeNotFound);

export default app;
