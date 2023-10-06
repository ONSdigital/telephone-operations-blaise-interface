import express, {NextFunction, Request, Response, Express} from "express";
import axios from "axios";
import path from "path";
import ejs from "ejs";
import dotenv from "dotenv";
import QuestionnaireRouter from "./Questionnaires";
import pinoLogger from "pino-http";
import BlaiseApiClient from "blaise-api-node-client";
import { EnvironmentVariables, getEnvironmentVariables } from "./Config";

export default function nodeServer(blaiseApiClient: BlaiseApiClient): Express {
const server = express();

axios.defaults.timeout = 15000;

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

// load the .env variables in the server
const {
    VM_EXTERNAL_CLIENT_URL,
    VM_EXTERNAL_WEB_URL,
    CATI_DASHBOARD_URL,
    BIMS_CLIENT_ID,
    BIMS_API_URL
} = getEnvironmentVariables();

// where ever the react built package is
const buildFolder = "../../build";

server.use(pinoLogger());

// treat the index.html as a template and substitute the values at runtime
server.set("views", path.join(__dirname, buildFolder));
server.engine("html", ejs.renderFile);
server.use(
    "/static",
    express.static(path.join(__dirname, `${buildFolder}/static`)),
);

// Load api Instruments routes from QuestionnaireRouter
server.use("/api", QuestionnaireRouter(VM_EXTERNAL_WEB_URL, BIMS_CLIENT_ID, BIMS_API_URL, blaiseApiClient));

// Health Check endpoint
server.get("/tobi-ui/:version/health", async function (req: Request, res: Response) {
    res.status(200).json({healthy: true});
});

server.get("*", function (req: Request, res: Response) {
    //const clientUrl = environmentVariables.VM_EXTERNAL_CLIENT_URL;
    //const dashboardUrl = environmentVariables.CATI_DASHBOARD_URL;
    res.render("index.html", {
        VM_EXTERNAL_CLIENT_URL, CATI_DASHBOARD_URL
    });
});

server.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    req.log.error(err.stack);
    res.render("../views/500.html", {});
});

return server;
}

