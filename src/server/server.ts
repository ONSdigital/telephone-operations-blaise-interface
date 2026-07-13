import express, { Request, Response, Express } from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from "dotenv";
import helmet from "helmet";
import QuestionnaireRouter from "./Questionnaires";
import pinoLogger from "pino-http";
import { BlaiseApiClient } from "blaise-api-node-client";
import { EnvironmentVariables } from "./Config";

export default function nodeServer(environmentVariables: EnvironmentVariables, blaiseApiClient: BlaiseApiClient): Express {
    const server = express();

    axios.defaults.timeout = 15000;

    if (process.env.NODE_ENV !== "production") {
        dotenv.config();
    }

    const isDev = process.env.NODE_ENV !== "production";

    // where ever the react built package is (relative to project root, not __dirname)
    const buildFolder = path.resolve(__dirname, "../../build/client");

    server.use(pinoLogger());

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
                clientUrl, dashboardUrl
            });
        });
    } else {
        // In dev mode, provide helpful message for non-API routes
        server.get(/.*/, function (req: Request, res: Response) {
            res.status(404).json({
                message: "UI is served on http://localhost:3000",
                hint: "This server (port 5000) only handles /api routes in development"
            });
        });
    }

    server.use(function (err: Error, req: Request, res: Response, next: Function) {
        req.log.error(err.stack);
        if (isDev) {
            res.status(500).json({ error: err.message, stack: err.stack });
        } else {
            res.status(500).render("../views/500.html", {});
        }
    });

    return server;
}

