import React, { ReactElement, useEffect, useState } from "react";
import { DefaultErrorBoundary } from "./Components/ErrorHandling/DefaultErrorBoundary";
import { isDevEnv, isTrainingEnv } from "./Functions";
import { Routes, Route } from "react-router-dom";
import InstrumentList from "./Components/InstrumentList";
import SurveyList from "./Components/SurveyList";
import { Survey } from "blaise-api-node-client";
import { ErrorBoundary } from "./Components/ErrorHandling/ErrorBoundary";
import { Footer, Header, ONSErrorPanel, ExternalLink } from "blaise-design-system-react-components";

interface listError {
    error: boolean,
    message: string
}

interface window extends Window {
    VM_EXTERNAL_CLIENT_URL: string
    CATI_DASHBOARD_URL: string
}

const divStyle = {
    minHeight: "calc(67vh)"
};

function App(): ReactElement {

    const [headerText, setHeaderText] = useState<string>("Telephone Operations Blaise Interface");

    useEffect(() => {
        if (isTrainingEnv()) setHeaderText("Telephone Operations Blaise Interface (training)");
    });

    const [externalClientUrl, setExternalClientUrl] = useState<string>("External URL should be here");
    const [externalCATIUrl, setExternalCATIUrl] = useState<string>("/Blaise/CaseInfo");

    useEffect(function retrieveVariables() {
        setExternalClientUrl(isDevEnv() ?
            process.env.REACT_APP_VM_EXTERNAL_CLIENT_URL || externalClientUrl : (window as unknown as window).VM_EXTERNAL_CLIENT_URL);
        setExternalCATIUrl(isDevEnv() ?
            process.env.REACT_APP_CATI_DASHBOARD_URL || externalCATIUrl : (window as unknown as window).CATI_DASHBOARD_URL);
    }, [externalClientUrl, externalCATIUrl]);

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
                        isDevEnv() && console.log(json);
                        setSurveys(json);
                        setListError({ error: false, message: "" });

                        // If the list is empty then show this message in the list
                        if (json.length === 0) setListError({ error: false, message: "No active surveys found." });
                    })
                    .catch((error) => {
                        isDevEnv() && console.error("Unable to read json from response, error: " + error);
                        setListError({ error: true, message: "Unable to load surveys" });
                    });
            }).catch((error) => {
                isDevEnv() && console.error("Failed to retrieve instrument list, error: " + error);
                setListError({ error: true, message: "Unable to load surveys" });
            }
            );
    }

    return (
        <>
            <Header title={headerText} />
            <div style={divStyle} className="ons-page__container ons-container">
                <main id="main-content" className="ons-page__main">
                    <DefaultErrorBoundary>
                        <h1>Interviewing</h1>
                        <p>
                            This page provides information on active questionnaires with corresponding links that
                            redirect to specific areas of CATI dashboard.
                        </p>
                        <p>
                            Please note, the table containing information on active questionnaires may
                            take a few seconds to load.
                        </p>
                        {listError.error && <ONSErrorPanel />}
                        <p className="ons-u-mt-m">
                            <ExternalLink text={"Link to CATI dashboard"}
                                link={externalCATIUrl}
                                id={"cati-dashboard"} />
                        </p>
                        <Routes>
                            <Route 
                                path="/survey/:survey" 
                                element={
                                    <ErrorBoundary errorMessageText={"Unable to load questionnaire table correctly"}>
                                        <InstrumentList list={surveys} listError={listError} />
                                    </ErrorBoundary>
                                }
                            />
                            <Route 
                                path="/" 
                                element={
                                    <ErrorBoundary errorMessageText={"Unable to load survey table correctly"}>
                                        <SurveyList list={surveys} listError={listError} />
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
