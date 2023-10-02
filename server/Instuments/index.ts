import express, { Request, Response, Router } from "express";
import BlaiseApiClient,  { Questionnaire } from "blaise-api-node-client";
import { Survey } from "../../Interfaces"
import axios, { AxiosResponse } from "axios";
import _ from "lodash";
import { fieldPeriodToText } from "../Functions";
import AuthProvider from "../AuthProvider";
import { Logger } from "../Logger";

function groupBySurvey(activeInstruments: Questionnaire[]) {
    return _.chain(activeInstruments)
        .groupBy("surveyTLA")
        .map((value: Questionnaire[], key: string) => ({ survey: key, questionnaires: value }))
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

    const bac = new BlaiseApiClient(`http://${BLAISE_API_URL}`);

    instrumentRouter.get("/instruments", async (req: Request, res: Response) => {
        const log: Logger = req.log;

        log.debug("get list of items");

        const authProvider: AuthProvider = new AuthProvider(bimsClientID, log);

        async function getToStartDate(instrument: Questionnaire) {
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

        
        function addExtraInstrumentFields(instrument: Questionnaire): Questionnaire {
            return {
                ...instrument,
                surveyTLA: instrument.name.substr(0, 3),
                link: `https://${ vmExternalWebUrl }/${ instrument.name }?LayoutSet=CATI-Interviewer_Large`,
                fieldPeriod: fieldPeriodToText(instrument.name),
            };
        }
        

        async function activeToday(instrument: Questionnaire) {
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

        async function getActiveTodayInstrument(instrument: Questionnaire): Promise<Questionnaire | null> {
            const active = await activeToday(instrument);
            log.info(`Active today outputted (${active}) for instrument (${instrument.name}) type of (${typeof active})`);
            return active ? instrument : null;
        }

        async function getActiveTodayInstruments(allInstruments: Questionnaire[]): Promise<Questionnaire[]> {
            return (await Promise.all(allInstruments.map(getActiveTodayInstrument)))
                .filter((result) => result !== null) as Questionnaire[];
        }

        async function getAllInstruments(): Promise<Questionnaire[]> {
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
