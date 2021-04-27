import app from "./server";
import * as profiler from "@google-cloud/profiler";

profiler.start({logLevel: 4}).catch((err: unknown) => {
    console.log(`Failed to start profiler: ${err}`);
});

const port: string = process.env.PORT || "5000";
app.listen(port);

console.log("App is listening on port " + port);
