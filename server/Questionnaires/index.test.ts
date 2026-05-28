import express, { NextFunction, Request, Response } from "express";
import supertest from "supertest";
import MockAdapter from "axios-mock-adapter";

import QuestionnaireRouter from "./index";
import axios from "axios";
import getGoogleAuthToken from "../AuthProvider/GoogleTokenProvider";
import { Logger } from "../Logger";
import { P } from "pino";
import BlaiseApiClient, { Questionnaire } from "blaise-api-node-client";
import { IMock, Mock } from "typemoq";
import { EnvironmentVariables } from "../Config";

jest.mock("../AuthProvider/GoogleTokenProvider");
const blaiseApiMock: IMock<BlaiseApiClient> = Mock.ofType(BlaiseApiClient);

describe("QuestionnaireRouter", () => {
    const app = express();
    const mockHttp = new MockAdapter(axios);

    const log: Logger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    };

    app.use((req: Request, res: Response, next: NextFunction) => {
        req.log = log as P.Logger<P.LoggerOptions>;
        next();
    });

    const environmentVariables: EnvironmentVariables = {
        VM_EXTERNAL_WEB_URL: "vm.com",
        BIMS_CLIENT_ID: "bims-id",
        BIMS_API_URL: "http://bims.com",
        VM_EXTERNAL_CLIENT_URL: "",
        BLAISE_API_URL: "",
        CATI_DASHBOARD_URL: ""
    };

    app.use(QuestionnaireRouter(
        environmentVariables,
        blaiseApiMock.object
    ));

    const request = supertest(app);

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    afterEach(() => {
        blaiseApiMock.reset();
        jest.resetAllMocks();
    });

    it("returns 500 when questionnaires endpoint errors", async () => {
        // aarnge
        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).throws(new Error());

        // act
        const response = await request.get("/questionnaires");

        // assert
        expect(response.status).toBe(500);
        expect(log.error).toHaveBeenCalledWith("Failed to retrieve instrument list");
    });


    it("sends the auth header to BIMS", async () => {
        // arrange
        const questionnaire: Questionnaire = {
            name: "OPN2211A",
            installDate: "2022-07-12",
            serverParkName: "example-park",
            activeToday: true
        };

        let sentHeaders;
        (getGoogleAuthToken as jest.Mock).mockImplementation(() => Promise.resolve("example-token"));
        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => [questionnaire]);
        mockHttp.onGet(`http://bims.com/tostartdate/${questionnaire.name}`)
            .reply(({ headers }) => {
                sentHeaders = headers;
                return [200, { tostartdate: today.toISOString() }];
            });

        // act
        await request.get("/questionnaires");

        // assert        
        expect(sentHeaders).toHaveProperty("Authorization", "Bearer example-token");
    });

    it("returns the instrument when tostartdate errors and questionnaire is active today", async () => {
        // arrange 
        const questionnaire: Questionnaire = {
            name: "OPN2211A",
            installDate: "2022-07-12",
            serverParkName: "example-park",
            activeToday: true
        };

        const expectedQuestionnaire = {
            ...questionnaire,
            fieldPeriod: "November 2022",
            link: `https://vm.com/${questionnaire.name}?LayoutSet=CATI-Interviewer_Large`,
            surveyTla: "OPN",
        };

        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => [questionnaire]);
        mockHttp.onGet(`http://bims.com/tostartdate/${questionnaire.name}`).reply(500);

        // act    
        const response = await request.get("/questionnaires");

        // assert
        expect(response.status).toBe(200);

        expect(response.body).toEqual([
            {
                questionnaires: [expectedQuestionnaire],
                survey: "OPN"
            }
        ]);
        expect(log.debug).toHaveBeenCalledWith(`the instrument ${questionnaire.name} is live for TO (TO start date = Not set) (Active today = true)`);
        expect(log.info).toHaveBeenCalledWith("Retrieved active instruments, 1 item/s");
        expect(log.warn).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith("The BIMS request responded with a status of 500 and a body of undefined");
    });


    it("does not return the instrument when tostartdate errors questionnaire is not active today", async () => {
        // arrange 
        const questionnaire: Questionnaire = {
            name: "OPN2211A",
            installDate: "2022-07-12",
            serverParkName: "example-park",
            activeToday: false
        };

        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => [questionnaire]);
        mockHttp.onGet(`http://bims.com/tostartdate/${questionnaire.name}`).reply(500);

        // act
        const response = await request.get("/questionnaires");

        // assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
        expect(log.debug).toHaveBeenCalledWith(`the instrument ${questionnaire.name} is live for TO (TO start date = Not set) (Active today = false)`);
        expect(log.info).toHaveBeenCalledWith("Retrieved active instruments, 0 item/s");
        expect(log.warn).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith("The BIMS request responded with a status of 500 and a body of undefined");
    });


    it("returns the instrument when tostartdate response type is not json and questionnaire is active today", async () => {
        // arrange 
        const questionnaire: Questionnaire = {
            name: "OPN2211A",
            installDate: "2022-07-12",
            serverParkName: "example-park",
            activeToday: true
        };

        const expectedQuestionnaire = {
            ...questionnaire,
            fieldPeriod: "November 2022",
            link: `https://vm.com/${questionnaire.name}?LayoutSet=CATI-Interviewer_Large`,
            surveyTla: "OPN",
            activeToday: true
        };

        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => [questionnaire]);
        mockHttp
            .onGet(`http://bims.com/tostartdate/${questionnaire.name}`)
            .reply(200, {}, { "content-type": "text/html" });

        // act
        const response = await request.get("/questionnaires");

        // assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                questionnaires: [expectedQuestionnaire],
                survey: "OPN"
            }
        ]);
        expect(log.debug).toHaveBeenCalledWith("The BIMS request responded with a status of 200 and a body of [object Object]");
        expect(log.debug).toHaveBeenCalledWith(`the instrument ${questionnaire.name} is live for TO (TO start date = Not set) (Active today = true)`);
        expect(log.info).toHaveBeenCalledWith("Retrieved active instruments, 1 item/s");
        expect(log.warn).not.toHaveBeenCalled();
        expect(log.error).not.toHaveBeenCalled();
    });

    // today

    it("returns the instrument when tostartdate is today and active today", async () => {
        // arrange 
        const questionnaire: Questionnaire = {
            name: "OPN2211A",
            installDate: "2022-07-12",
            serverParkName: "example-park",
            activeToday: true
        };

        const expectedQuestionnaire = {
            ...questionnaire,
            fieldPeriod: "November 2022",
            link: `https://vm.com/${questionnaire.name}?LayoutSet=CATI-Interviewer_Large`,
            surveyTla: "OPN",
            activeToday: true
        };

        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => [questionnaire]);
        mockHttp
            .onGet(`http://bims.com/tostartdate/${questionnaire.name}`)
            .reply(200, { tostartdate: today.toISOString() }, { "content-type": "application/json" });

        // act
        const response = await request.get("/questionnaires");

        // assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                questionnaires: [expectedQuestionnaire],
                survey: "OPN"
            }
        ]);
        expect(log.debug).toHaveBeenCalledWith("The BIMS request responded with a status of 200 and a body of [object Object]");
        expect(log.debug).toHaveBeenCalledWith(expect.stringMatching(/the instrument OPN2211A is live for TO \(TO start date = .*\) \(Active today = true\)/));
        expect(log.info).toHaveBeenCalledWith("Retrieved active instruments, 1 item/s");
        expect(log.warn).not.toHaveBeenCalled();
        expect(log.error).not.toHaveBeenCalled();
    });


    it("does not return the instrument when tostartdate is today and not active today", async () => {
        // arrange 
        const questionnaire: Questionnaire = {
            name: "OPN2211A",
            installDate: "2022-07-12",
            serverParkName: "example-park",
            activeToday: false
        };

        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => [questionnaire]);
        mockHttp
            .onGet(`http://bims.com/tostartdate/${questionnaire.name}`)
            .reply(200, { tostartdate: today.toISOString() }, { "content-type": "application/json" });

        // act            
        const response = await request.get("/questionnaires");

        // assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
        expect(log.debug).toHaveBeenCalledWith("The BIMS request responded with a status of 200 and a body of [object Object]");
        expect(log.debug).toHaveBeenCalledWith(expect.stringMatching(/the instrument OPN2211A is live for TO \(TO start date = .*\) \(Active today = false\)/));
        expect(log.info).toHaveBeenCalledWith("Retrieved active instruments, 0 item/s");
        expect(log.warn).not.toHaveBeenCalled();
        expect(log.error).not.toHaveBeenCalled();
    });

    // tomorrow

    it("does not return the instrument when tostartdate is tomorrow and active today", async () => {
        // arrange 
        const questionnaire: Questionnaire = {
            name: "OPN2211A",
            installDate: "2022-07-12",
            serverParkName: "example-park",
            activeToday: true
        };

        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => [questionnaire]);
        mockHttp
            .onGet(`http://bims.com/tostartdate/${questionnaire.name}`)
            .reply(200, { tostartdate: tomorrow.toISOString() }, { "content-type": "application/json" });

        // act
        const response = await request.get("/questionnaires");

        // assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
        expect(log.debug).toHaveBeenCalledWith("The BIMS request responded with a status of 200 and a body of [object Object]");
        expect(log.debug).toHaveBeenCalledWith(expect.stringMatching(/the instrument OPN2211A is not currently live for TO \(TO start date = .*\) \(Active today = true\)/));
        expect(log.info).toHaveBeenCalledWith("Retrieved active instruments, 0 item/s");
        expect(log.warn).not.toHaveBeenCalled();
        expect(log.error).not.toHaveBeenCalled();
    });

    it("does not return the instrument when tostartdate is tomorrow and not active today", async () => {
        // arrange 
        const questionnaire: Questionnaire = {
            name: "OPN2211A",
            installDate: "2022-07-12",
            serverParkName: "example-park",
            activeToday: false
        };

        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => [questionnaire]);
        mockHttp
            .onGet(`http://bims.com/tostartdate/${questionnaire.name}`)
            .reply(200, { tostartdate: tomorrow.toISOString() }, { "content-type": "application/json" });

        // act
        const response = await request.get("/questionnaires");

        // assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
        expect(log.debug).toHaveBeenCalledWith("The BIMS request responded with a status of 200 and a body of [object Object]");
        expect(log.debug).toHaveBeenCalledWith(expect.stringMatching(/the instrument OPN2211A is not currently live for TO \(TO start date = .*\) \(Active today = false\)/));
        expect(log.info).toHaveBeenCalledWith("Retrieved active instruments, 0 item/s");
        expect(log.warn).not.toHaveBeenCalled();
        expect(log.error).not.toHaveBeenCalled();
    });

    // yesterday - both

    it("returns the instrument when tostartdate is yesterday and active today", async () => {
        // arrange 
        const questionnaire: Questionnaire = {
            name: "OPN2211A",
            installDate: "2022-07-12",
            serverParkName: "example-park",
            activeToday: true
        };

        const expectedQuestionnaire = {
            ...questionnaire,
            fieldPeriod: "November 2022",
            link: `https://vm.com/${questionnaire.name}?LayoutSet=CATI-Interviewer_Large`,
            surveyTla: "OPN",
            activeToday: true
        };

        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => [questionnaire]);
        mockHttp
            .onGet(`http://bims.com/tostartdate/${questionnaire.name}`)
            .reply(200, { tostartdate: today.toISOString() }, { "content-type": "application/json" });

        // act
        const response = await request.get("/questionnaires");

        // asert
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                questionnaires: [expectedQuestionnaire],
                survey: "OPN"
            }
        ]);
        expect(log.debug).toHaveBeenCalledWith("The BIMS request responded with a status of 200 and a body of [object Object]");
        expect(log.debug).toHaveBeenCalledWith(expect.stringMatching(/the instrument OPN2211A is live for TO \(TO start date = .*\) \(Active today = true\)/));
        expect(log.info).toHaveBeenCalledWith("Retrieved active instruments, 1 item/s");
        expect(log.warn).not.toHaveBeenCalled();
        expect(log.error).not.toHaveBeenCalled();
    });


    it("does not return the instrument when tostartdate is yesterday and not active today", async () => {
        // arrange 
        const questionnaire: Questionnaire = {
            name: "OPN2211A",
            installDate: "2022-07-12",
            serverParkName: "example-park",
            activeToday: false
        };

        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => [questionnaire]);
        mockHttp
            .onGet(`http://bims.com/tostartdate/${questionnaire.name}`)
            .reply(200, { tostartdate: today.toISOString() }, { "content-type": "application/json" });

        // act
        const response = await request.get("/questionnaires");

        // assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
        expect(log.debug).toHaveBeenCalledWith("The BIMS request responded with a status of 200 and a body of [object Object]");
        expect(log.debug).toHaveBeenCalledWith(expect.stringMatching(/the instrument OPN2211A is live for TO \(TO start date = .*\) \(Active today = false\)/));
        expect(log.info).toHaveBeenCalledWith("Retrieved active instruments, 0 item/s");
        expect(log.warn).not.toHaveBeenCalled();
        expect(log.error).not.toHaveBeenCalled();
    });

    it("sets the field period from the number in the questionnaire name", async () => {
        // arrange 
        const questionnaire: Questionnaire = {
            name: "XXXXX05",
            installDate: "2022-07-12",
            serverParkName: "example-park",
            activeToday: true
        };

        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => [questionnaire]);
        mockHttp
            .onGet(`http://bims.com/tostartdate/${questionnaire.name}`)
            .reply(200, { tostartdate: today.toISOString() }, { "content-type": "application/json" });

        // act
        const response = await request.get("/questionnaires");

        // assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                questionnaires: [{
                    activeToday: true,
                    fieldPeriod: "May 20XX",
                    installDate: "2022-07-12",
                    link: "https://vm.com/XXXXX05?LayoutSet=CATI-Interviewer_Large",
                    name: "XXXXX05",
                    serverParkName: "example-park",
                    surveyTla: "XXX",
                }],
                survey: "XXX"
            }
        ]);
    });
});
