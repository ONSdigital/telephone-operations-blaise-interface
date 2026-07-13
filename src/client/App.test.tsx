import React from "react";
import { render, waitFor, fireEvent, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import flushPromises from "./tests/utils";
import { act } from "react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { Survey } from "./types/Survey";

const surveyListReturned: Survey[] = [
    {
        survey: "OPN",
        questionnaires: [
            {
                activeToday: true,
                fieldPeriod: "July 2020",
                installDate: "2020-12-11T11:53:55.5612856+00:00",
                link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
                name: "OPN2007T",
                serverParkName: "LocalDevelopment",
                surveyTla: "OPN"
            }
        ]
    }
];

function mock_server_request(returnedStatus: number, returnedJSON: Survey[]) {
    global.fetch = vi.fn(() =>
        Promise.resolve({
            status: returnedStatus,
            json: () => Promise.resolve(returnedJSON),
        })
    ) as vi.Mock;
}

function mock_server_malformed_response(returnedStatus: number, returnedJSON: { text: string }) {
    global.fetch = vi.fn(() =>
        Promise.resolve({
            status: returnedStatus,
            json: () => Promise.resolve(returnedJSON),
        })
    ) as vi.Mock;
}

describe("React homepage", () => {
    beforeAll(() => {
        mock_server_request(200, surveyListReturned);
    });

    it("view surveys page matches Snapshot", async () => {
        const wrapper = render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("view questionnaires page matches Snapshot", async () => {
        const wrapper = render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
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
        const { getByText, queryByText, getByRole } = render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/Telephone Operations Blaise Interface/i)).toBeDefined();
            expect(queryByText(/Link to CATI dashboard/i)).toBeInTheDocument();
            expect(getByRole("link", { name: /Link to CATI dashboard/i }).getAttribute("href")).toContain("/Blaise/CaseInfo");
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
        vi.clearAllMocks();
        cleanup();
    });
});

describe("Given the API returns malformed json", () => {
    beforeAll(() => {
        mock_server_malformed_response(200, { text: "Hello" });
    });

    it("it should render with the error message displayed", async () => {
        const { getAllByText, queryByText } = render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getAllByText(/Unable to load surveys/i).length).toBeGreaterThan(0);
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    });

    afterAll(() => {
        vi.clearAllMocks();
        cleanup();
    });
});

describe("Given the API returns an empty list", () => {
    beforeAll(() => {
        mock_server_request(200, []);
    });

    it("it should render with a message to inform the user in the list", async () => {
        const { getByText, queryByText } = render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/No active surveys found./i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    });

    afterAll(() => {
        vi.clearAllMocks();
        cleanup();
    });
});
