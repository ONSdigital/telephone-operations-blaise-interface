import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { defineFeature, loadFeature } from "jest-cucumber";
import React from "react";
import { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

import App from "../../App";
import flushPromises from "../../tests/utils";

import { survey_list_with_OPN_and_LMS_with_one_active_instrument_each } from "./API_Mock_Objects";

import type { Survey } from "../../types/Survey";

const feature = loadFeature("./src/client/features/CATI_Dashboard_Link.feature");

function mock_server_request(returnedStatus: number, returnedJSON: Survey[]) {
  (globalThis as any).fetch = vi.fn(() =>
    Promise.resolve({
      status: returnedStatus,
      json: () => Promise.resolve(returnedJSON),
    }),
  ) as any;
}

defineFeature(feature, (test) => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  beforeEach(() => {
    cleanup();
  });

  test("Following the Cati dashboard link takes a user to the case info page", ({
    given,
    when,
    then,
  }) => {
    given("I access the Telephone Operations Blaise Interface URL", async () => {
      mock_server_request(200, survey_list_with_OPN_and_LMS_with_one_active_instrument_each);

      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>,
      );
      await act(async () => {
        await flushPromises();
      });
    });

    when("the link to the CATI dashboard is present", async () => {
      await waitFor(() => {
        expect(screen.getByText(/Link to CATI dashboard/i));
      });
    });

    then("it will take me to the CATI dashboard", async () => {
      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /Link to CATI dashboard/i }).getAttribute("href"),
        ).toContain("/Blaise/CaseInfo");
      });
    });
  });
});
