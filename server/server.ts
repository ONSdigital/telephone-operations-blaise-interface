import express, {NextFunction, Request, Response} from "express";
import axios from "axios";
import path from "path";
import ejs from "ejs";
import dotenv from "dotenv";
import InstrumentRouter from "./Instuments";
import {getEnvironmentVariables} from "./Config";

const server = express();

axios.defaults.timeout = 10000;

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

// where ever the react built package is
const buildFolder = "../../build";

// load the .env variables in the server
const {VM_EXTERNAL_CLIENT_URL, 
    VM_EXTERNAL_WEB_URL, 
    BLAISE_API_URL, 
    CATI_DASHBOARD_URL, 
    BIMS_CLIENT_ID,
    BIMS_API_URL} = getEnvironmentVariables();

// treat the index.html as a template and substitute the values at runtime
server.set("views", path.join(__dirname, buildFolder));
server.engine("html", ejs.renderFile);
server.use(
    "/static",
    express.static(path.join(__dirname, `${buildFolder}/static`)),
);

// Load api Instruments routes from InstrumentRouter
server.use("/api", InstrumentRouter(BLAISE_API_URL, VM_EXTERNAL_WEB_URL, BIMS_CLIENT_ID, BIMS_API_URL));

// Health Check endpoint
server.get("/tobi-ui/:version/health", async function (req: Request, res: Response) {
    console.log("Heath Check endpoint called");
    res.status(200).json({healthy: true});
});

server.get("*", function (req: Request, res: Response) {
    res.render("index.html", {
        VM_EXTERNAL_CLIENT_URL, CATI_DASHBOARD_URL
    });
});

server.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack);
    res.render("../views/500.html", {});
});
export default server;
