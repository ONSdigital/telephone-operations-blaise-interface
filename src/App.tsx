import React, {ReactElement, useEffect, useState} from "react";
import Header from "./Components/Header";
import BetaBanner from "./Components/BetaBanner";
import ExternalLink from "./Components/ExternalLink";
import {DefaultErrorBoundary} from "./Components/DefaultErrorBoundary";
import {ErrorBoundary} from "./Components/ErrorBoundary";
import "./App.css";
import Footer from "./Components/Footer";
import ONSErrorPanel from "./Components/ONSErrorPanel";
import {isDevEnv} from "./Functions";

interface ListItem {
    name: string
    link: string
    id: string
    status: string
    "server-park": string
    date: string
    "install-date": string
}

interface listError {
    error: boolean,
    message: string
}

interface window extends Window {
    VM_EXTERNAL_CLIENT_URL: string
    CATI_DASHBOARD_URL: string
}

function App() : ReactElement {

    const [externalClientUrl, setExternalClientUrl] = useState<string>("External URL should be here");
    const [externalCATIUrl, setExternalCATIUrl] = useState<string>("/Blaise");


    useEffect(function retrieveVariables() {
        setExternalClientUrl(isDevEnv() ?
            process.env.REACT_APP_VM_EXTERNAL_CLIENT_URL || externalClientUrl : (window as unknown as window).VM_EXTERNAL_CLIENT_URL);
        setExternalCATIUrl(isDevEnv() ?
            process.env.REACT_APP_CATI_DASHBOARD_URL || externalCATIUrl : (window as unknown as window).CATI_DASHBOARD_URL);
    }, [externalClientUrl, externalCATIUrl]);

    const [list, setList] = useState<ListItem[]>([]);
    const [listError, setListError] = useState<listError>({error: false, message: "Loading ..."});

    useEffect(() => {
        getList();
    }, []);

    function getList() {
        fetch("/api/instruments")
            .then((r: Response) => {
                if (r.status === 200) {
                    r.json()
                        .then((json: ListItem[]) => {
                                console.log("Retrieved instrument list, " + json.length + " items/s");
                                isDevEnv() && console.log(json);
                                setList(json);
                                setListError({error: false, message: ""});
                            }
                        ).catch(() => {
                        console.error("Unable to read json from response");
                        setListError({error: true, message: "Unable to load surveys"});
                    });
                } else {
                    console.error("Failed to retrieve instrument list, status " + r.status);
                    setListError({error: true, message: "Unable to load surveys"});
                }
            }).catch(() => {
                console.error("Failed to retrieve instrument list");
                setListError({error: true, message: "Unable to load surveys"});
            }
        );
    }


    return (
        <>
            <BetaBanner/>
            <Header title={"Blaise Survey Manager Lite"}/>
            <div id={"body"} className="page__container container">
                <main id="main-content" className="page__main">
                    <DefaultErrorBoundary>
                        <h1>Interviewing</h1>
                        <p>
                            This page provides information on active survey instruments with corresponding links that
                            redirect to specific areas of CATI dashboard.
                        </p>
                        <p>
                            Please note, the table containing information on active survey instrument information may
                            take a few seconds to load
                        </p>
                        {listError.error && <ONSErrorPanel/>}
                        <p className="u-mt-m">
                            <ExternalLink text={"Link to CATI dashboard"}
                                          link={externalCATIUrl}/>
                        </p>
                        <h3>Active surveys table</h3>
                        <table id="basic-table" className="table ">
                            <ErrorBoundary errorMessageText={"Unable to load survey table correctly"}>
                                <thead className="table__head u-mt-m">
                                <tr className="table__row">
                                    <th scope="col" className="table__header ">
                                        <span>Instrument</span>
                                    </th>
                                    <th scope="col" className="table__header ">
                                        <span>Date</span>
                                    </th>
                                    <th scope="col" className="table__header ">
                                        <span>Link to interview</span>
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="table__body">
                                {
                                    list && list.length > 0
                                        ?
                                        list.map((item: ListItem) => {
                                            return (
                                                <tr className="table__row" key={item.id}>
                                                    <td className="table__cell ">
                                                        {item.name}
                                                    </td>
                                                    <td className="table__cell ">
                                                        {item.date}
                                                    </td>
                                                    <td className="table__cell ">
                                                        <ExternalLink text={"Interview"}
                                                                      link={item.link}
                                                                      ariaLabel={"Launch interview for instrument " + item.name + " " + item.date}/>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                        :
                                        <tr>
                                            <td className="table__cell " colSpan={3}>
                                                {listError.message}
                                            </td>
                                        </tr>
                                }
                                </tbody>
                            </ErrorBoundary>
                        </table>
                    </DefaultErrorBoundary>
                </main>
            </div>
            <Footer external_client_url={externalClientUrl}/>
        </>
    );
}

export default App;
