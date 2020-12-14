/**
 * @jest-environment node
 */
import app from "../server"; // Link to your server file
import supertest from "supertest";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const request = supertest(app);

// This sets the mock adapter on the default instance
const mock = new MockAdapter(axios, {onNoMatch: "throwException"});


// Mock any GET request to /api/instruments
// arguments for reply are (status, data, headers)


describe("Given the API returns 2 instruments with only one that is active", () => {
    beforeAll(() => {
        mock.onGet("http://" + process.env.BLAISE_API_URL + "/api/v1/cati/instruments").reply(200,
            apiInstrumentList,
        );
    });

    const apiInstrumentList = [
        {
            activeToday: true,
            expired: false,
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            name: "OPN2007T",
            serverParkName: "LocalDevelopment"
        },
        {
            activeToday: false,
            expired: false,
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            name: "OPN2004A",
            serverParkName: "LocalDevelopment"
        }
    ];

    const instrumentListReturned = [
        {
            survey: "OPN",
            instruments: [
                {
                    activeToday: true,
                    fieldPeriod: "July 2020",
                    expired: false,
                    installDate: "2020-12-11T11:53:55.5612856+00:00",
                    link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
                    name: "OPN2007T",
                    serverParkName: "LocalDevelopment",
                    "surveyTLA": "OPN",
                }
            ]
        }

    ];

    it("should return a 200 status and a list with the one active instrument", async done => {
        const response = await request.get("/api/instruments");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].instruments).toHaveLength(1);
        expect(response.body).toStrictEqual(instrumentListReturned);
        done();
    });

    afterAll(() => {
        mock.reset();
    });
});

describe("Given the API returns 2 active instruments for the survey OPN", () => {
    beforeAll(() => {
        mock.onGet("http://" + process.env.BLAISE_API_URL + "/api/v1/cati/instruments").reply(200,
            apiInstrumentList,
        );
    });

    const apiInstrumentList = [
        {
            activeToday: true,
            expired: false,
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            name: "OPN2007T",
            serverParkName: "LocalDevelopment"
        },
        {
            activeToday: true,
            expired: false,
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            name: "OPN2004A",
            serverParkName: "LocalDevelopment"
        }
    ];

    const instrumentListReturned = [
        {
            survey: "OPN",
            instruments: [
                {
                    activeToday: true,
                    fieldPeriod: "July 2020",
                    expired: false,
                    installDate: "2020-12-11T11:53:55.5612856+00:00",
                    link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
                    name: "OPN2007T",
                    serverParkName: "LocalDevelopment",
                    "surveyTLA": "OPN",
                },
                {
                    activeToday: true,
                    fieldPeriod: "April 2020",
                    expired: false,
                    installDate: "2020-12-11T11:53:55.5612856+00:00",
                    link: "https://external-web-url/OPN2004A?LayoutSet=CATI-Interviewer_Large",
                    name: "OPN2004A",
                    serverParkName: "LocalDevelopment",
                    "surveyTLA": "OPN",
                }
            ]
        }

    ];

    it("should return a list with one survey with 2 instrument objects", async done => {
        const response = await request.get("/api/instruments");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveLength(1);

        expect(response.body[0].instruments).toHaveLength(2);
        expect(response.body).toStrictEqual(instrumentListReturned);
        done();
    });

    afterAll(() => {
        mock.reset();
    });
});


describe("Given the API returns 2 active instruments for 2 separate surveys ", () => {
    beforeAll(() => {
        mock.onGet("http://" + process.env.BLAISE_API_URL + "/api/v1/cati/instruments").reply(200,
            apiInstrumentList,
        );
    });

    const apiInstrumentList = [
        {
            activeToday: true,
            expired: false,
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            name: "IPS2007T",
            serverParkName: "LocalDevelopment"
        },
        {
            activeToday: true,
            expired: false,
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            name: "OPN2004A",
            serverParkName: "LocalDevelopment"
        }
    ];

    const instrumentListReturned = [
        {
            survey: "IPS",
            instruments: [
                {
                    activeToday: true,
                    fieldPeriod: "Field period unknown",
                    expired: false,
                    installDate: "2020-12-11T11:53:55.5612856+00:00",
                    link: "https://external-web-url/IPS2007T?LayoutSet=CATI-Interviewer_Large",
                    name: "IPS2007T",
                    serverParkName: "LocalDevelopment",
                    "surveyTLA": "IPS",
                }],
        },
        {
            survey: "OPN",
            instruments: [
                {
                    activeToday: true,
                    fieldPeriod: "April 2020",
                    expired: false,
                    installDate: "2020-12-11T11:53:55.5612856+00:00",
                    link: "https://external-web-url/OPN2004A?LayoutSet=CATI-Interviewer_Large",
                    name: "OPN2004A",
                    serverParkName: "LocalDevelopment",
                    "surveyTLA": "OPN",
                }
            ]
        }

    ];

    it("should return a list with 2 surveys with  instrument object in each", async done => {
        const response = await request.get("/api/instruments");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveLength(2);

        expect(response.body[0].instruments).toHaveLength(1);
        expect(response.body[1].instruments).toHaveLength(1);
        expect(response.body).toStrictEqual(instrumentListReturned);
        done();
    });

    afterAll(() => {
        mock.reset();
    });
});


describe("Get list of instruments endpoint fails", () => {
    beforeAll(() => {
        mock.onGet("http://" + process.env.BLAISE_API_URL + "/api/v1/cati/instruments").networkError();
    });

    it("should return a 500 status and an error message", async done => {
        const response = await request.get("/api/instruments");

        expect(response.statusCode).toEqual(500);
        expect(JSON.stringify(response.body)).toMatch(/(Network Error)/i);
        done();
    });

    afterAll(() => {
        mock.reset();
    });
});


import {defineFeature, loadFeature} from "jest-cucumber";


const feature = loadFeature("./src/features/TO_Interviewer_Happy_Path.feature", {tagFilter: "@server"});

defineFeature(feature, test => {


    /**
     *  Scenario 3b
     **/
    test("Do not show expired surveys in TOBI", ({given, when, then}) => {
        let selectedSurvey;
        let response;

        given("a survey questionnaire end date has passed", async () => {
            const apiInstrumentList = [
                {
                    activeToday: true,
                    expired: false,
                    installDate: "2020-12-11T11:53:55.5612856+00:00",
                    name: "OPN2007T",
                    serverParkName: "LocalDevelopment"
                },
                {
                    // this one is inactive
                    activeToday: false,
                    expired: false,
                    installDate: "2020-12-11T11:53:55.5612856+00:00",
                    name: "OPN2004A",
                    serverParkName: "LocalDevelopment"
                }
            ];

            mock.onGet("http://" + process.env.BLAISE_API_URL + "/api/v1/cati/instruments").reply(200,
                apiInstrumentList,
            );
            response = await request.get("/api/instruments");
        });

        when("I select the survey I am working on", async () => {
            selectedSurvey = response.body[0].instruments;
        });

        then("I will not see that questionnaire listed for the survey", () => {
            // Only the one active survey is returned
            expect(selectedSurvey).toHaveLength(1);

            const instrumentListReturned = [
                    {
                        activeToday: true,
                        fieldPeriod: "July 2020",
                        expired: false,
                        installDate: "2020-12-11T11:53:55.5612856+00:00",
                        link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
                        name: "OPN2007T",
                        serverParkName: "LocalDevelopment",
                        "surveyTLA": "OPN",
                    }
                ]
            ;
            expect(selectedSurvey).toStrictEqual(instrumentListReturned);
        });
    });

});
