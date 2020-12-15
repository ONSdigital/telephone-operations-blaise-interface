// React
import React from "react";
// Test modules
import {defineFeature, loadFeature} from "jest-cucumber";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {act} from "react-dom/test-utils";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import flushPromises from "../../tests/utils";
// Mock elements
import {
    survey_list_with_OPN_and_LMS_with_one_active_instrument_each,
    survey_list_with_OPN_with_three_active_instruments,
    survey_list_with_OPN_with_two_active_instruments
} from "./API_Mock_Objects";
// App components
import App from "../../App";
import {Survey} from "../../../Interfaces";

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/TO_Interviewer_Happy_Path.feature",
    {tagFilter: "not @server and not @integration"}
);

function mock_server_request(returnedStatus: number, returnedJSON: Survey[]) {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            status: returnedStatus,
            json: () => Promise.resolve(returnedJSON),
        })
    );
}

defineFeature(feature, test => {

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
    });

    beforeEach(() => {
        cleanup();
    });


    /**
     *  Scenario 2
     **/
    test("View live survey list in TOBI", ({given, when, then}) => {
        given("I am a Telephone Operations TO Interviewer", () => {
            mock_server_request(
                200,
                survey_list_with_OPN_and_LMS_with_one_active_instrument_each
            );
        });

        when("I launch TOBI", async () => {
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App/>
                </Router>
            );
            await act(async () => {
                await flushPromises();
            });
        });

        then("I will be able to view all live surveys with questionnaires loaded in Blaise, identified by their three letter acronym TLA, i.e. OPN, LMS", async () => {
            await waitFor(() => {
                expect(screen.getByText(/OPN/i)).toBeDefined();
                expect(screen.getByText(/LMS/i)).toBeDefined();
            });
        });
    });

    /**
     *  Scenario 2
     **/
    test("Select survey", ({given, when, then, and}) => {

        given("I can view a list of surveys on Blaise within TOBI", async () => {
            mock_server_request(
                200,
                survey_list_with_OPN_with_three_active_instruments
            );
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App/>
                </Router>
            );
            await act(async () => {
                await flushPromises();
            });
        });

        when("I select the survey I am working on", async () => {
            await fireEvent.click(screen.getByText(/View active questionnaires/i));
            await act(async () => {
                await flushPromises();
            });
        });

        then("I am presented with a list of active questionnaires to be worked on that day for that survey, i.e. within the the survey period start and end dates", async () => {
            await waitFor(() => {
                expect(screen.getByText(/Telephone Operations Blaise Interface/i)).toBeDefined();
                expect(screen.getByText(/OPN2004A/i)).toBeDefined();
                expect(screen.getByText(/OPN2007T/i)).toBeDefined();
                expect(screen.getByText(/OPN2101A/i)).toBeDefined();
            });
        });

        and("listed in order with latest installed questionnaire first", () => {
            const list = screen.queryAllByTestId(/instrument-table-row/i);

            const listItemOne = list[0];
            const firstRowData = listItemOne.firstChild;
            if (firstRowData !== null) {
                expect(firstRowData.textContent).toEqual("OPN2101A");
            }

            const listItemTwo = list[1];
            const secondRowData = listItemTwo.firstChild;
            if (secondRowData !== null) {
                expect(secondRowData.textContent).toEqual("OPN2004A");
            }


            const listItemThree = list[2];
            const thirdRowData = listItemThree.firstChild;
            if (thirdRowData !== null) {
                expect(thirdRowData.textContent).toEqual("OPN2007T");
            }
        });
    });

    /**
     *  Scenario 3c
     **/
    test("Return to select survey", ({given, when, then}) => {
        given("I have selected a survey", async () => {
            mock_server_request(
                200,
                survey_list_with_OPN_with_two_active_instruments
            );
            const history = createMemoryHistory();
            render(
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
        });

        when("I do not see the questionnaire that I am working on", () => {
            console.log(".");
        });

        then("I am able to go back to view the list of surveys", async () => {
            await fireEvent.click(screen.getByText(/Return to survey list/i));

            await act(async () => {
                await flushPromises();
            });

            expect(screen.getByText(/OPN/i)).toBeDefined();
            expect(screen.getByText(/Surveys/i)).toBeDefined();
        });
    });
});
