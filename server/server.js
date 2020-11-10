const Functions = require("./Functions");
const express = require("express");
const axios = require("axios");
// const nunjucks = require('nunjucks');
const path = require("path");

const server = express();

const axios_instance = axios.create();
axios_instance.defaults.timeout = 10000;

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// where ever the react built package is
const buildFolder = "../build";

// load the .env variables in the server
const {VM_EXTERNAL_CLIENT_URL, VM_EXTERNAL_WEB_URL, BLAISE_INSTRUMENT_CHECKER_URL, VM_INTERNAL_URL} = process.env;
const CATI_DASHBOARD_URL = "https://" + VM_EXTERNAL_WEB_URL + "/Blaise";

// treat the index.html as a template and substitute the value
// at runtime
server.set("views", path.join(__dirname, buildFolder));
server.engine("html", require("ejs").renderFile);
server.use(
    "/static",
    express.static(path.join(__dirname, `${buildFolder}/static`)),
);

// An api endpoint that returns list of installed instruments
server.get("/api/instruments", (req, res) => {
    console.log("get list of items");

    axios_instance.get("http://" + BLAISE_INSTRUMENT_CHECKER_URL + "/api/instruments?vm_name=" + VM_INTERNAL_URL)
        .then(function (response) {
            // Add interviewing link and date of instrument to array objects
            response.data.forEach(function (element) {
                element.link = "https://" + VM_EXTERNAL_WEB_URL + "/" + element.name + "?LayoutSet=CATI-Interviewer_Large";
                element.date = Functions.field_period_to_text(element.name);
            });
            console.log("Retrieved instrument list, " + response.data.length + " item/s");
            return res.json(response.data);
        })
        .catch(function (error) {
            // handle error
            console.error("Failed to retrieve instrument list");
            console.error(error);
            return res.status(500).json(error);
        });
});

// Health Check endpoint
server.get("/health_check", async function (req, res) {
    console.log("Heath Check endpoint called");
    res.status(200).json({status: 200});
});

server.get("*", function (req, res) {
    res.render("index.html", {
        VM_EXTERNAL_CLIENT_URL, CATI_DASHBOARD_URL
    });
});

server.use(function (err, req, res) {
    console.error(err.stack);
    res.render("../views/500.html", {});
});

module.exports = server;
