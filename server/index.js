const app = require("./server.js");

const port = process.env.PORT || 5000;
app.listen(port);

console.log("App is listening on port " + port);
