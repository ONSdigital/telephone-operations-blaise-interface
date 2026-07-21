import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";

import App, { buildCatiHref, resolveUrlFromBase } from "./App";
import flushPromises from "./test-utils";

import type { Survey } from "./types/Survey";

describe("App URL helpers", () => {
  it("returns absolute URL unchanged when resolving from base", () => {
    const absoluteUrl = "https://external-cati.example/Blaise/CaseInfo";

    expect(resolveUrlFromBase("https://external-tobi.example", absoluteUrl)).toBe(absoluteUrl);
  });

  it("returns absolute CATI URL unchanged when building href", () => {
    const absoluteUrl = "https://external-cati.example/Blaise/CaseInfo";

    expect(buildCatiHref("external-tobi.example", absoluteUrl)).toBe(absoluteUrl);
  });

  it("resolves relative URL from valid base URL", () => {
    expect(resolveUrlFromBase("https://external-tobi.example", "/Blaise/CaseInfo")).toBe(
      "https://external-tobi.example/Blaise/CaseInfo",
    );
  });

  it("returns original relative URL when base URL is invalid", () => {
    expect(resolveUrlFromBase("not-a-valid-url", "/Blaise/CaseInfo")).toBe("/Blaise/CaseInfo");
  });

  it("builds CATI href from placeholder host using current origin", () => {
    expect(buildCatiHref("External URL should be here", "/Blaise/CaseInfo")).toBe(
      "https://dev-cati.social-surveys.gcp.onsdigital.uk/Blaise/CaseInfo",
    );
  });

  it("builds CATI href by replacing tobi with cati in host", () => {
    expect(
      buildCatiHref("dev-ben1-tobi.social-surveys.gcp.onsdigital.uk", "/Blaise/CaseInfo"),
    ).toBe("https://dev-ben1-cati.social-surveys.gcp.onsdigital.uk/Blaise/CaseInfo");
  });
});

const surveyListReturned: Survey[] = [
  {
    survey: "OPN",
    questionnaires: [
      {
        fieldPeriod: "July 2020",
        installDate: "2020-12-11T11:53:55.5612856+00:00",
        link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
        name: "OPN2007T",
        serverParkName: "LocalDevelopment",
        surveyTla: "OPN",
      },
    ],
  },
];

function mock_server_request(returnedStatus: number, returnedJSON: Survey[]) {
  (globalThis as any).fetch = vi.fn(() =>
    Promise.resolve({
      status: returnedStatus,
      json: () => Promise.resolve(returnedJSON),
    }),
  ) as any;
}

function mock_server_malformed_response(returnedStatus: number, returnedJSON: { text: string }) {
  (globalThis as any).fetch = vi.fn(() =>
    Promise.resolve({
      status: returnedStatus,
      json: () => Promise.resolve(returnedJSON),
    }),
  ) as any;
}

describe("React homepage", () => {
  beforeAll(() => {
    mock_server_request(200, surveyListReturned);
  });

  it("view surveys page matches Snapshot", async () => {
    const wrapper = render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
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
      </MemoryRouter>,
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
      </MemoryRouter>,
    );

    expect(queryByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText(/Telephone Operations Blaise Interface/i)).toBeDefined();
      expect(queryByText(/Link to CATI dashboard/i)).toBeInTheDocument();
      expect(getByRole("link", { name: /Link to CATI dashboard/i }).getAttribute("href")).toContain(
        "/Blaise/CaseInfo",
      );
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
      </MemoryRouter>,
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
      </MemoryRouter>,
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
