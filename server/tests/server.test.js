/**
 * @jest-environment node
 */
import app from "../server"; // Link to your server file
import supertest from "supertest";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
const request = supertest(app);

// This sets the mock adapter on the default instance
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

// Mocked list returned from BLAISE_INSTRUMENT_CHECKER_URL
const instrumentList = [
    {
        id: "ID-001",
        "install-date": "2020-11-06T15:39:11.7029227+00:00",
        name: "OPN2101A"
    }
];

// Expected result from /api/instruments with link and date appended.
const instrumentListReturned = [
    {
        id: "ID-001",
        "install-date": "2020-11-06T15:39:11.7029227+00:00",
        name: "OPN2101A",
        "link": "https://external-web-url/OPN2101A?LayoutSet=CATI-Interviewer_Large",
        "date": "February 2021"
    }
];

// Mock any GET request to /api/instruments
// arguments for reply are (status, data, headers)


describe("Get list of instruments endpoint", () => {
    beforeEach(() => {
        mock.onGet("http://" + process.env.BLAISE_INSTRUMENT_CHECKER_URL + "/api/instruments?vm_name=internal-url").reply(200,
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
});



describe("Get list of instruments endpoint fails", () => {
    beforeEach(() => {
        mock.onGet("http://" + process.env.BLAISE_INSTRUMENT_CHECKER_URL + "/api/instruments?vm_name=internal-url").networkError();

    });

    it("should return a 500 status and an error message", async done => {
        const response = await request.get("/api/instruments");

        expect(response.statusCode).toEqual(500);
        expect(JSON.stringify(response.body)).toMatch(/(Network Error)/i);
        done();
    });
});