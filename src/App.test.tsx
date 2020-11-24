import React from "react";
import Enzyme, { shallow} from "enzyme";
import {render, waitFor,screen} from "@testing-library/react";
// import FetchMock from "@react-mock/fetch";
import Adapter from "enzyme-adapter-react-16";
import App from "./App";
import "@testing-library/jest-dom";
import flushPromises from "./test/util/flushPromises";
import {act} from "react-dom/test-utils";

const instrumentListReturned = [
    {
        id: "ID-001",
        "install-date": "2020-11-06T15:39:11.7029227+00:00",
        name: "OPN2101A",
        "link": "https://external-web-url/OPN2101A?LayoutSet=CATI-Interviewer_Large",
        "date": "February 2021"
    }
];

describe("React homepage", () => {
    Enzyme.configure({adapter: new Adapter()});

    beforeAll(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve(instrumentListReturned),
            })
        );
    });


    it("matches Snapshot", async () => {
        const wrapper = render(<App/>);

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });

    });

    it("should render correctly", async () => {
        const {getByText, queryByText } = render(<App/>);

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/Blaise Survey Manager Lite/i)).toBeDefined();
            expect(getByText(/OPN2101A/i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
    });
});

