import { defineFeature, loadFeature } from "jest-cucumber";
import { Survey } from "../../../rest_api";
import { createMemoryHistory } from "history";
import { render, screen, waitFor } from "@testing-library/react";
import { Router } from "react-router";
import App from "../../App";
import { act } from "react-dom/test-utils";
import flushPromises from "../../tests/utils";
import React from "react";

const feature = loadFeature(
    "./src/features/TO_Interviewer_Exception_Paths.feature",
    { tagFilter: "not @server and not @integration" }
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
    test("Accessing Blaise via Blaise 5 User Interface: Blaise is down/not responding", ({ given, when, then }) => {
        given("I am a Blaise user trying to access via TOBI", () => {
            mock_server_request(500, []);
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App />
                </Router>
            );
        });

        when("Blaise is down/not responding", async () => {
            await act(async () => {
                await flushPromises();
            });
        });

        then("I am presented with an error message informing me that Blaise cannot be accessed Message to be displayed", async () => {
            await waitFor(() => {
                expect(screen.getByText(/Sorry, there is a problem with this service. We are working to fix the problem. Please try again later./i)).toBeDefined();
            });
        });
    });
});
