import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import InstrumentList from "./InstrumentList";

import type { Survey } from "../../types/Survey";

vi.mock("blaise-design-system-react-components", () => ({
  ExternalLink: ({ text, link }: { text: string; link: string }) => <a href={link}>{text}</a>,
  ErrorPanel: ({ text }: { text: string }) => <div>{text}</div>,
}));

describe("InstrumentList", () => {
  it("renders active questionnaires for the selected survey", () => {
    const list: Survey[] = [
      {
        survey: "OPN",
        questionnaires: [
          {
            name: "OPN2007T",
            fieldPeriod: "July 2020",
            link: "https://example/OPN2007T",
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            serverParkName: "LocalDevelopment",
            surveyTla: "OPN",
          },
        ],
      },
    ];

    render(
      <MemoryRouter initialEntries={["/survey/OPN"]}>
        <Routes>
          <Route
            path="/survey/:survey"
            element={
              <InstrumentList
                list={list}
                listError={{ error: false, message: "" }}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Active questionnaires/i)).toBeInTheDocument();
    expect(screen.getByText("OPN2007T")).toBeInTheDocument();
    expect(screen.getByText("Interview")).toBeInTheDocument();
  });

  it("shows error panel when no questionnaires match selected survey", () => {
    const list: Survey[] = [
      {
        survey: "OPN",
        questionnaires: [],
      },
    ];

    render(
      <MemoryRouter initialEntries={["/survey/LMS"]}>
        <Routes>
          <Route
            path="/survey/:survey"
            element={
              <InstrumentList
                list={list}
                listError={{ error: false, message: "" }}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("No active questionnaires for survey LMS")).toBeInTheDocument();
  });
});
