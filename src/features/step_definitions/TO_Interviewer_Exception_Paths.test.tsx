import { defineFeature, loadFeature } from "jest-cucumber";
import { Survey } from "blaise-api-node-client";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";
import { act } from "react";
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
    ) as jest.Mock;
}

defineFeature(feature, test => {
    test("Accessing Blaise via Blaise 5 User Interface: Blaise is down/not responding", ({ given, when, then }) => {
        given("I am a Blaise user trying to access via TOBI", () => {
            mock_server_request(500, []);
            render(
                <MemoryRouter>
                    <App />
                </MemoryRouter>
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
