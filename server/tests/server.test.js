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

// Mocked list returned from BLAISE_INSTRUMENT_CHECKER_URL
const instrumentList = [
    {
        activeToday: true,
        expired: false,
        installDate: "2020-12-11T11:53:55.5612856+00:00",
        name: "OPN2007T",
        serverParkName: "LocalDevelopment"
    }
];

// Expected result from /api/instruments with link and date appended.
const instrumentListReturned = [
    {
        activeToday: true,
        date: "August 2020",
        expired: false,
        installDate: "2020-12-11T11:53:55.5612856+00:00",
        link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
        name: "OPN2007T",
        serverParkName: "LocalDevelopment"
    }
];

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
            activeToday: true,
            date: "August 2020",
            expired: false,
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
            name: "OPN2007T",
            serverParkName: "LocalDevelopment"
        }
    ];

    it("should return a 200 status and a list with the one active instrument", async done => {
        const response = await request.get("/api/instruments");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveLength(1);
        expect(response.body).toStrictEqual(instrumentListReturned);
        done();
    });

    afterAll(() => {
        mock.reset();
    });
});


describe("Get list of instruments endpoint with an inactive", () => {
    beforeAll(() => {
        mock.onGet("http://" + process.env.BLAISE_API_URL + "/api/v1/cati/instruments").reply(200,
            instrumentList,
        );
    });

    it("should return a 200 status and a list with one instrument", async done => {
        const response = await request.get("/api/instruments");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveLength(1);
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
