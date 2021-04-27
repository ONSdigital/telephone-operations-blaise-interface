import React from "react";
import {render, waitFor, fireEvent, screen, cleanup} from "@testing-library/react";
import App from "./App";
import "@testing-library/jest-dom";
import flushPromises from "./tests/utils";
import {act} from "react-dom/test-utils";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import {Survey} from "../Interfaces";

const surveyListReturned: Survey[] = [
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
                surveyDays: []
            }
        ]
    }
];

function mock_server_request(returnedStatus: number, returnedJSON: any) {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            status: returnedStatus,
            json: () => Promise.resolve(returnedJSON),
        })
    );
}

describe("React homepage", () => {

    beforeAll(() => {
        mock_server_request(200, surveyListReturned);
    });


    it("view surveys page matches Snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <App/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("view questionnaires page matches Snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <App/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await fireEvent.click(screen.getByText(/View active questionnaires/i));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });

    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();
        const {getByText, queryByText } = render(
            <Router history={history}>
                <App/>
            </Router>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/Telephone Operations Blaise Interface/i)).toBeDefined();
            expect(getByText(/OPN/i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

        await fireEvent.click(getByText(/View active questionnaires/i));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(getByText(/Telephone Operations Blaise Interface/i)).toBeDefined();
            expect(getByText(/OPN2007T/i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});


describe("Given the API returns malformed json", () => {

    beforeAll(() => {
        mock_server_request(200, {text: "Hello"});
    });

    it("it should render with the error message displayed", async () => {
        const history = createMemoryHistory();
        const {getByText, queryByText } = render(
            <Router history={history}>
                <App/>
            </Router>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();


        await waitFor(() => {
            expect(getByText(/Sorry, there is a problem with this service. We are working to fix the problem. Please try again later./i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Given the API returns an empty list", () => {

    beforeAll(() => {
        mock_server_request(200, []);
    });

    it("it should render with a message to inform the user in the list", async () => {
        const history = createMemoryHistory();
        const {getByText, queryByText } = render(
            <Router history={history}>
                <App/>
            </Router>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();


        await waitFor(() => {
            expect(getByText(/No active surveys found./i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
