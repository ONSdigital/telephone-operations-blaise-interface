import { BlaiseApiClient } from "blaise-api-node-client";
import nodeServer from "./server";
import { getEnvironmentVariables } from "./Config";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}
// load the .env variables in the server
const environmentVariables = getEnvironmentVariables();

const port: string = process.env.PORT || "5000";

// create client
const blaiseApiClient = new BlaiseApiClient(environmentVariables.BLAISE_API_URL);

// create app
const app = nodeServer(environmentVariables, blaiseApiClient);

app.listen(port);

console.log("App is listening on port " + port);