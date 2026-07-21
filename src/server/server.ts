import path from "path";
import { fileURLToPath } from "url";

import axios from "axios";
import dotenv from "dotenv";
import ejs from "ejs";
import express from "express";
import helmet from "helmet";
import pinoLogger from "pino-http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import QuestionnaireRouter from "./handlers/questionnaires.js";

import type { EnvironmentVariables } from "./Config.js";
import type { BlaiseApiClient } from "blaise-api-node-client";
import type { Express, Request, Response } from "express";

export default function nodeServer(
  environmentVariables: EnvironmentVariables,
  blaiseApiClient: BlaiseApiClient,
): Express {
  const server = express();

  axios.defaults.timeout = 15000;

  if (process.env.NODE_ENV !== "production") {
    dotenv.config();
  }

  const isDev = process.env.NODE_ENV !== "production";

  // where ever the react built package is (relative to project root, not __dirname)
  const buildFolder = path.resolve(__dirname, "../../build/client");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  server.use((pinoLogger as any)());

  server.set("trust proxy", 1);
  server.disable("x-powered-by");
  server.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "img-src": ["'self'", "data:", "https://cdn.ons.gov.uk"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  if (!isDev) {
    // treat the index.html as a template and substitute the values at runtime
    server.set("views", buildFolder);
    server.engine("html", ejs.renderFile);
    server.use(express.static(buildFolder));
  }

  // Load api Instruments routes from QuestionnaireRouter
  server.use("/api", QuestionnaireRouter(environmentVariables, blaiseApiClient));

  // Health Check endpoint
  server.get("/tobi-ui/:version/health", async function (req: Request, res: Response) {
    res.status(200).json({ healthy: true });
  });

  if (!isDev) {
    server.get(/.*/, function (req: Request, res: Response) {
      const clientUrl = environmentVariables.VM_EXTERNAL_CLIENT_URL;
      const dashboardUrl = environmentVariables.CATI_DASHBOARD_URL;

      res.render("index.html", {
        clientUrl,
        dashboardUrl,
      });
    });
  } else {
    // In dev mode, provide helpful message for non-API routes
    server.get(/.*/, function (req: Request, res: Response) {
      res.status(404).json({
        message: "UI is served on http://localhost:3000",
        hint: "This server (port 5000) only handles /api routes in development",
      });
    });
  }

  server.use(function (err: Error, req: Request, res: Response, _next: unknown) {
    req.log.error(err.stack);
    if (isDev) {
      res.status(500).json({ error: err.message, stack: err.stack });
    } else {
      res.status(500).render("../views/500.html", {});
    }
  });

  return server;
}
