import express, { Request, Response, Router } from "express";
import _ from "lodash";
import Functions from "../Functions";
import BlaiseApiRest, { Instrument, Survey } from "../../rest_api";


export default function InstrumentRouter(BLAISE_API_URL: string, VM_EXTERNAL_WEB_URL: string): Router {
    "use strict";
    const instrumentRouter = express.Router();
    const blaiseApiRest = new BlaiseApiRest(`http://${BLAISE_API_URL}`);


    // An api endpoint that returns list of installed instruments
    instrumentRouter.get("/instruments", (req: Request, res: Response) => {
        console.log("get list of items");

        async function activeToday(instrument: Instrument) {
            const liveDate = await blaiseApiRest.getLiveDate(instrument);
            if (liveDate == null || liveDate <= Date.now()) {
                console.log(`the instrument ${instrument.name} is live (live date = ${liveDate}) (Active today = ${instrument.activeToday})`);
                return instrument.activeToday;
            }
            console.log(`the instrument ${instrument.name} is not currently live (live date = ${liveDate}) (Active today = ${instrument.activeToday})`);
            return false;
        }

        blaiseApiRest.getAllInstrumentsWithCatiData().then(async allInstruments => {
            const activeInstruments: Instrument[] = [];
            // Add interviewing link and date of instrument to array objects
            await Promise.all(allInstruments.map(async function (instrument: Instrument) {
                const active = await activeToday(instrument);
                console.log(`Active today outputted (${active}) for instrument (${instrument.name}) type of (${typeof active})`)
                if (active) {
                    instrument.surveyTLA = instrument.name.substr(0, 3);
                    instrument.link = "https://" + VM_EXTERNAL_WEB_URL + "/" + instrument.name + "?LayoutSet=CATI-Interviewer_Large";
                    instrument.fieldPeriod = Functions.field_period_to_text(instrument.name);
                    activeInstruments.push(instrument);
                }
            }));

            console.log("Retrieved active instruments, " + activeInstruments.length + " item/s");

            const surveys: Survey[] = _.chain(activeInstruments)
                // Group the elements of Array based on `surveyTLA` property
                .groupBy("surveyTLA")
                // `key` is group's name (surveyTLA), `value` is the array of objects
                .map((value: Instrument[], key: string) => ({ survey: key, instruments: value }))
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
