import express, { Request, Response, Express } from "express";
import axios from "axios";
import path from "path";
import ejs from "ejs";
import dotenv from "dotenv";
import QuestionnaireRouter from "./Questionnaires";
import pinoLogger from "pino-http";
import BlaiseApiClient from "blaise-api-node-client";
import { EnvironmentVariables } from "./Config";

export default function nodeServer(environmentVariables: EnvironmentVariables, blaiseApiClient: BlaiseApiClient): Express {
    const server = express();

    axios.defaults.timeout = 15000;

    if (process.env.NODE_ENV !== "production") {
        dotenv.config();
    }

    // where ever the react built package is
    const buildFolder = "../build";

    server.use(pinoLogger());

    // treat the index.html as a template and substitute the values at runtime
    server.set("views", path.join(__dirname, buildFolder));
    server.engine("html", ejs.renderFile);
    server.use(
        "/static",
        express.static(path.join(__dirname, `${buildFolder}/static`)),
    );

    // Load api Instruments routes from QuestionnaireRouter
    server.use("/api", QuestionnaireRouter(environmentVariables, blaiseApiClient));

    // Health Check endpoint
    server.get("/tobi-ui/:version/health", async function (req: Request, res: Response) {
        res.status(200).json({ healthy: true });
    });

    server.get(/.*/, function (req: Request, res: Response) {
        const clientUrl = environmentVariables.VM_EXTERNAL_CLIENT_URL;
        const dashboardUrl = environmentVariables.CATI_DASHBOARD_URL;
        res.render("index.html", {
            clientUrl, dashboardUrl
        });
    });

    server.use(function (err: Error, req: Request, res: Response) {
        req.log.error(err.stack);
        res.status(500);
        res.render("../views/500.html", {});
    });

    return server;
}

