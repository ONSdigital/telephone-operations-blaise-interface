import { ExternalLink, Footer, Header, LoadingPanel } from "blaise-design-system-react-components";
import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import InstrumentList from "./pages/InstrumentListPage";
import SurveyList from "./pages/SurveyListPage";
import { DefaultErrorBoundary } from "./utils/ErrorHandling/DefaultErrorBoundary";
import { ErrorBoundary } from "./utils/ErrorHandling/ErrorBoundary";
import { isDevEnv, isTrainingEnv } from "./utils/Functions";

import type { Survey } from "./types/Survey";
import type { ReactElement } from "react";

interface listError {
  error: boolean;
  message: string;
}

interface window extends Window {
  VM_EXTERNAL_CLIENT_URL: string;
  CATI_DASHBOARD_URL: string;
}

function resolveUrlFromBase(baseUrl: string, maybeRelativeUrl: string): string {
  if (/^https?:\/\//i.test(maybeRelativeUrl)) {
    return maybeRelativeUrl;
  }

  try {
    return new URL(maybeRelativeUrl, baseUrl).toString();
  } catch {
    return maybeRelativeUrl;
  }
}

function buildCatiHref(externalClientUrl: string, externalCATIUrl: string): string {
  if (/^https?:\/\//i.test(externalCATIUrl)) {
    return externalCATIUrl;
  }

  const hasValidClientHost =
    externalClientUrl.trim() !== "" && externalClientUrl !== "External URL should be here";

  if (!hasValidClientHost) {
    return externalCATIUrl;
  }

  return `https://${externalClientUrl}${externalCATIUrl}`;
}

const divStyle = {
  minHeight: "calc(67vh)",
};

function App(): ReactElement {
  const [headerText, setHeaderText] = useState<string>("Telephone Operations Blaise Interface");

  // eslint-disable-next-line @eslint-react/exhaustive-deps
  useEffect(() => {
    // eslint-disable-next-line @eslint-react/set-state-in-effect
    if (isTrainingEnv()) setHeaderText("Telephone Operations Blaise Interface (training)");
  });

  const [externalClientUrl, setExternalClientUrl] = useState<string>("External URL should be here");
  const [externalCATIUrl, setExternalCATIUrl] = useState<string>("/Blaise/CaseInfo");

  useEffect(
    function retrieveVariables() {
      const runtimeWindow = window as unknown as window;

      const resolvedClientUrl = isDevEnv()
        ? import.meta.env.VITE_APP_VM_EXTERNAL_CLIENT_URL ||
          runtimeWindow.VM_EXTERNAL_CLIENT_URL ||
          "External URL should be here"
        : runtimeWindow.VM_EXTERNAL_CLIENT_URL ||
          import.meta.env.VITE_APP_VM_EXTERNAL_CLIENT_URL ||
          "External URL should be here";

      let resolvedCatiUrl = isDevEnv()
        ? import.meta.env.VITE_APP_CATI_DASHBOARD_URL ||
          runtimeWindow.CATI_DASHBOARD_URL ||
          "/Blaise/CaseInfo"
        : runtimeWindow.CATI_DASHBOARD_URL ||
          import.meta.env.VITE_APP_CATI_DASHBOARD_URL ||
          "/Blaise/CaseInfo";

      resolvedCatiUrl = resolveUrlFromBase(resolvedClientUrl, resolvedCatiUrl);

      console.log(`App.tsx CATI_DASHBOARD_URL = ${runtimeWindow.CATI_DASHBOARD_URL}`);
      console.log(
        `App.tsx import.meta.env.VITE_APP_CATI_DASHBOARD_URL = ${import.meta.env.VITE_APP_CATI_DASHBOARD_URL}`,
      );

      console.log(`before ${resolvedCatiUrl}`);

      // Replace "tobi" with "cati" in the URL if present
      resolvedCatiUrl = resolvedCatiUrl.includes("tobi")
        ? resolvedCatiUrl.replace(/tobi/gi, "cati")
        : resolvedCatiUrl;

      console.log(`after ${resolvedCatiUrl}`);

      // eslint-disable-next-line @eslint-react/set-state-in-effect
      setExternalClientUrl(resolvedClientUrl);
      // eslint-disable-next-line @eslint-react/set-state-in-effect
      setExternalCATIUrl(resolvedCatiUrl);

      console.log(`externalClientUrl = ${externalClientUrl}`);
    },
    [externalCATIUrl, externalClientUrl],
  );

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [listError, setListError] = useState<listError>({ error: false, message: "Loading ..." });

  useEffect(() => {
    getList();
  }, []);

  function getList() {
    fetch("/api/questionnaires")
      .then((r: Response) => {
        if (r.status !== 200) {
          throw r.status + " - " + r.statusText;
        }

        r.json()
          .then((json: Survey[]) => {
            if (!Array.isArray(json)) {
              throw "Json response is not a list";
            }

            console.log("Retrieved instrument list, " + json.length + " items/s");
            void (isDevEnv() && console.log(json));
            setSurveys(json);
            setListError({ error: false, message: "" });

            // If the list is empty then show this message in the list
            if (json.length === 0) {
              setListError({ error: false, message: "No active surveys found." });
            }
          })
          .catch((error) => {
            void (
              isDevEnv() && console.error("Unable to read json from response, error: " + error)
            );
            setListError({ error: true, message: "Unable to load surveys" });
          });
      })
      .catch((error) => {
        void (isDevEnv() && console.error("Failed to retrieve instrument list, error: " + error));
        setListError({ error: true, message: "Unable to load surveys" });
      });
  }

  return (
    <>
      <Header title={headerText} />
      <div
        style={divStyle}
        className="ons-page__container ons-container"
      >
        <main
          id="main-content"
          className="ons-page__main"
        >
          <DefaultErrorBoundary>
            <h1>Interviewing</h1>
            <p>
              This page provides information on active questionnaires with corresponding links that
              redirect to specific areas of CATI dashboard.
            </p>
            <p>
              Please note, the table containing information on active questionnaires may take a few
              seconds to load.
            </p>
            {listError.error && <LoadingPanel message={listError.message} />}
            <p className="ons-u-mt-m">
              <ExternalLink
                text={"Link to CATI dashboard"}
                link={buildCatiHref(externalClientUrl, externalCATIUrl)}
                id={"cati-dashboard"}
              />
            </p>
            <Routes>
              <Route
                path="/survey/:survey"
                element={
                  <ErrorBoundary errorMessageText={"Unable to load questionnaire table correctly"}>
                    <InstrumentList
                      list={surveys}
                      listError={listError}
                    />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/"
                element={
                  <ErrorBoundary errorMessageText={"Unable to load survey table correctly"}>
                    <SurveyList
                      list={surveys}
                      listError={listError}
                    />
                  </ErrorBoundary>
                }
              />
            </Routes>
          </DefaultErrorBoundary>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default App;
