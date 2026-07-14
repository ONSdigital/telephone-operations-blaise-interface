import { render, screen, waitFor } from "@testing-library/react";
import { defineFeature, loadFeature } from "jest-cucumber";
import { act } from "react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

import App from "../../App";
import flushPromises from "../../test-utils";

import type { Survey } from "../../types/Survey";

const feature = loadFeature("./src/client/features/TO_Interviewer_Exception_Paths.feature", {
  tagFilter: "not @server and not @integration",
});

function mock_server_request(returnedStatus: number, returnedJSON: Survey[]) {
  (globalThis as any).fetch = vi.fn(() =>
    Promise.resolve({
      status: returnedStatus,
      json: () => Promise.resolve(returnedJSON),
    }),
  ) as any;
}

defineFeature(feature, (test) => {
  test("Accessing Blaise via Blaise 5 User Interface: Blaise is down/not responding", ({
    given,
    when,
    then,
  }) => {
    given("I am a Blaise user trying to access via TOBI", () => {
      mock_server_request(500, []);
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>,
      );
    });

    when("Blaise is down/not responding", async () => {
      await act(async () => {
        await flushPromises();
      });
    });

    then(
      "I am presented with an error message informing me that Blaise cannot be accessed Message to be displayed",
      async () => {
        await waitFor(() => {
          expect(screen.getAllByText(/Unable to load surveys/i).length).toBeGreaterThan(0);
        });
      },
    );
  });
});
