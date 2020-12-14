import express, {Request, Response, Router} from "express";
import {Instrument, Survey} from "../../Interfaces";
import axios, {AxiosResponse} from "axios";
import _ from "lodash";
import Functions from "../Functions";


export default function InstrumentRouter(BLAISE_API_URL: string, VM_EXTERNAL_WEB_URL: string): Router {
    "use strict";
    const instrumentRouter = express.Router();


    // An api endpoint that returns list of installed instruments
    instrumentRouter.get("/instruments", (req: Request, res: Response) => {
        console.log("get list of items");

        function activeDay(instrument: Instrument) {
            return instrument.activeToday === true;
        }

        axios.get("http://" + BLAISE_API_URL + "/api/v1/cati/instruments")
            .then(function (response: AxiosResponse) {
                let instruments: Instrument[] = response.data;
                // Add interviewing link and date of instrument to array objects
                instruments.forEach(function (element: Instrument) {
                    element.surveyTLA = element.name.substr(0, 3);
                    element.link = "https://" + VM_EXTERNAL_WEB_URL + "/" + element.name + "?LayoutSet=CATI-Interviewer_Large";
                    element.fieldPeriod = Functions.field_period_to_text(element.name);
                });

                console.log("Retrieved instrument list, " + instruments.length + " item/s");

                // Filter the instruments by activeToday filed
                instruments = instruments.filter(activeDay);

                console.log("Retrieved active instruments, " + instruments.length + " item/s");


                const surveys: Survey[] = _.chain(instruments)
                    // Group the elements of Array based on `surveyTLA` property
                    .groupBy("surveyTLA")
                    // `key` is group's name (surveyTLA), `value` is the array of objects
                    .map((value: Instrument[], key: string) => ({survey: key, instruments: value}))
                    .value();
                return res.json(surveys);
            })
            .catch(function (error) {
                // handle error
                console.error("Failed to retrieve instrument list");
                console.error(error);
                return res.status(500).json(error);
            });
    });

    return instrumentRouter;
}

