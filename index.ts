import app from "./server/server.js";
import source_map from "source-map-support";
source_map.install();

const port: string = process.env.PORT || "5000";
app.listen(port);

console.log("App is listening on port " + port);
