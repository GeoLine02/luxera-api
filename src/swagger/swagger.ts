import e from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import path from "path";

const router = e.Router();
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Luxera API",
      version: "1.0.0",
    },
  },
  // Use glob patterns to find all swagger files
  apis: [
    path.join(__dirname, "schemas.ts"),
    path.join(__dirname, "paths", "*.ts"),
  ],
};

const swaggerDocs = swaggerJSDoc(options);

// Serve the Swagger UI at the router root. App mounts this router at `/api-docs`.
router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

export default router;