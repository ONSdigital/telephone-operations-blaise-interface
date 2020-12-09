import app from "./server";

const port: string = process.env.PORT || "5000";
app.listen(port);

console.log("App is listening on port " + port);
