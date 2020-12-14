import React from "react";
import Enzyme from "enzyme";
import {render, waitFor, fireEvent, screen} from "@testing-library/react";
import Adapter from "enzyme-adapter-react-16";
import App from "./App";
import "@testing-library/jest-dom";
import flushPromises from "./tests/utils";
import {act} from "react-dom/test-utils";
import {createMemoryHistory} from "history";
import {Router} from "react-router";

const surveyListReturned = [
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

describe("React homepage", () => {
    Enzyme.configure({adapter: new Adapter()});

    beforeAll(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve(surveyListReturned),
            })
        );
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
    });
});
