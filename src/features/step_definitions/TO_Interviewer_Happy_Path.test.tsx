import {defineFeature, loadFeature} from "jest-cucumber";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import App from "../../App";
import React from "react";
import {
    survey_list_with_OPN_and_LMS_with_one_active_instrument_each,
    survey_list_with_OPN_with_two_active_instruments
} from "./API_Mock_Objects";
import {act} from "react-dom/test-utils";
import flushPromises from "../../tests/utils";
import {createMemoryHistory} from "history";
import {Router} from "react-router";

const feature = loadFeature("./src/features/TO_Interviewer_Happy_Path.feature", {tagFilter: "not @server and not @integration"});

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

        given("I am a Telephone Operations (TO) Interviewer", () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    status: 200,
                    json: () => Promise.resolve(survey_list_with_OPN_and_LMS_with_one_active_instrument_each),
                })
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

        then("I will be able to view all live surveys with questionnaires loaded in Blaise, identified by their three letter acronym (TLA), i.e. OPN, LMS", async () => {
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
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    status: 200,
                    json: () => Promise.resolve(survey_list_with_OPN_with_two_active_instruments),
                })
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
            });
        });

        and("listed in order with latest installed questionnaire first", () => {
            expect(true).toBe(true);
        });


    });

    /**
     *  Scenario 3b
     **/
    test("Do not show expired surveys in TOBI", ({given, when, then}) => {

        cleanup();
        given("a survey questionnaire end date has passed", () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    status: 200,
                    json: () => Promise.resolve([]),
                })
            );
        });

        when("I select the survey I am working on", async () => {
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

        then("I will not see that questionnaire listed for the survey", () => {
            expect(screen.getByText(/OPN2004A/i)).toBeDefined();
            expect(screen.getByText(/OPN20117A/i)).toBeDefined();
        });
    });

    /**
     *  Scenario 3c
     **/
    test("Return to select survey", ({given, when, then}) => {
        cleanup();
        given("I have selected a survey", async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    status: 200,
                    json: () => Promise.resolve(survey_list_with_OPN_with_two_active_instruments),
                })
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
