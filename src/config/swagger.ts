import { Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express API Gateway",
      version: "1.0.0",
      description: "Documentation for the Express API Gateway",
    },
    servers: [{ url: "http://localhost:8000" }],
  },
  //
  apis: ["./src/api/**/*.ts", "./src/utils/errors/*.ts", "./src/config/swagger-common-schemas.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export default function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
