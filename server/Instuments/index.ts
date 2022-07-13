import express, { Request, Response, Router } from "express";
import { Instrument, Survey } from "../../Interfaces";
import axios, { AxiosResponse } from "axios";
import _ from "lodash";
import { fieldPeriodToText } from "../Functions";
import AuthProvider from "../AuthProvider";
import { Logger } from "../Logger";

function groupBySurvey(activeInstruments: Instrument[]) {
    return _.chain(activeInstruments)
        .groupBy("surveyTLA")
        .map((value: Instrument[], key: string) => ({ survey: key, instruments: value }))
        .value();
}

export default function InstrumentRouter(
    blaiseApiUrl: string,
    vmExternalWebUrl: string,
    bimsClientID: string,
    bimsApiUrl: string
): Router {
    "use strict";
    const instrumentRouter = express.Router();

    instrumentRouter.get("/instruments", async (req: Request, res: Response) => {
        const log: Logger = req.log;

        log.debug("get list of items");

        const authProvider: AuthProvider = new AuthProvider(bimsClientID, log);

        async function getToStartDate(instrument: Instrument) {
            const authHeader = await authProvider.getAuthHeader();
            const response: AxiosResponse = await axios.get(
                `${bimsApiUrl}/tostartdate/${instrument.name}`,
                {
                    headers: authHeader,
                    validateStatus: function (status) { return status >= 200; }
                });

            const logMessage = `The BIMS request responded with a status of ${ response.status } and a body of ${ response.data }`;

            if (response.status !== 200) {
                log.error(logMessage);
                return null;
            }

            log.debug(logMessage);

            return response.headers["content-type"] == "application/json" ? response.data.tostartdate : null;
        }

        function addExtraInstrumentFields(instrument: Instrument): Instrument {
            return {
                ...instrument,
                surveyTLA: instrument.name.substr(0, 3),
                link: `https://${ vmExternalWebUrl }/${ instrument.name }?LayoutSet=CATI-Interviewer_Large`,
                fieldPeriod: fieldPeriodToText(instrument.name),
            };
        }

        async function activeToday(instrument: Instrument) {
            const telOpsStartDate = await getToStartDate(instrument);

            if (telOpsStartDate == null) {
                log.debug(`the instrument ${instrument.name} is live for TO (TO start date = Not set) (Active today = ${instrument.activeToday})`);
                return instrument.activeToday;
            }

            if (Date.parse(telOpsStartDate) <= Date.now()) {
                log.debug(`the instrument ${instrument.name} is live for TO (TO start date = ${telOpsStartDate}) (Active today = ${instrument.activeToday})`);
                return instrument.activeToday;
            }

            log.debug(`the instrument ${instrument.name} is not currently live for TO (TO start date = ${telOpsStartDate}) (Active today = ${instrument.activeToday})`);
            return false;
        }

        async function getActiveTodayInstrument(instrument: Instrument): Promise<Instrument | null> {
            const active = await activeToday(instrument);
            log.info(`Active today outputted (${active}) for instrument (${instrument.name}) type of (${typeof active})`);
            return active ? instrument : null;
        }

        async function getActiveTodayInstruments(allInstruments: Instrument[]): Promise<Instrument[]> {
            return (await Promise.all(allInstruments.map(getActiveTodayInstrument)))
                .filter((result) => result !== null) as Instrument[];
        }

        async function getAllInstruments(): Promise<Instrument[]> {
            const response: AxiosResponse = await axios.get(`http://${blaiseApiUrl}/api/v2/cati/questionnaires`);
            return response.data;
        }

        async function getSurveys(): Promise<Survey[]> {
            const allInstruments = await getAllInstruments();
            const activeInstruments = await getActiveTodayInstruments(allInstruments);
            log.info(`Retrieved active instruments, ${activeInstruments.length} item/s`);
            return groupBySurvey(activeInstruments.map(addExtraInstrumentFields));
        }

        try {
            res.json(await getSurveys());
        } catch(error) {
            log.error("Failed to retrieve instrument list");
            log.error(error);
            res.status(500).json(error);
        }
    });

    return instrumentRouter;
}
