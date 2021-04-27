import React, {ReactElement} from "react";
import {Link, useParams} from "react-router-dom";
import {Instrument, Survey} from "../../Interfaces";
import {ExternalLink, ONSPanel} from "blaise-design-system-react-components";


interface listError {
    error: boolean,
    message: string
}

interface Props {
    list: Survey[],
    listError: listError
}

interface Params {
    survey: string
}

function InstrumentList(props: Props): ReactElement {
    const {list, listError}: Props = props;
    const {survey}: Params = useParams();

    const filteredSurvey: Survey[] = list.filter((obj: Survey) => {
        return obj.survey === survey;
    });

    let surveyInstruments: Instrument[] = [];
    if (filteredSurvey.length === 1) {
        surveyInstruments = filteredSurvey[0].instruments;
    } else if (filteredSurvey.length !== 1) {
        listError.message = "No active questionnaires for survey " + survey;
    } else {
        listError.message = "Unable to load questionnaires for survey " + survey;
    }

    surveyInstruments.sort((a: Instrument, b: Instrument) => Date.parse(b.installDate) - Date.parse(a.installDate));

    return <>
        <p>
            <Link to={"/"} id={"return-to-survey-list"}>Return to survey list</Link>
        </p>

        <h2>Active questionnaires</h2>
        {
            surveyInstruments && surveyInstruments.length > 0
                ?
                <table id="instrument-table" className="table ">
                    <thead className="table__head u-mt-m">
                    <tr className="table__row">
                        <th scope="col" className="table__header ">
                            <span>Questionnaire</span>
                        </th>
                        <th scope="col" className="table__header ">
                            <span>Field period</span>
                        </th>
                        <th scope="col" className="table__header ">
                            <span>Link to interview</span>
                        </th>
                    </tr>
                    </thead>
                    <tbody className="table__body">
                    {
                        surveyInstruments.map((item: Instrument) => {
                            return (
                                <tr className="table__row" key={item.name} data-testid={"instrument-table-row"}>
                                    <td className="table__cell ">
                                        {item.name}
                                    </td>
                                    <td className="table__cell ">
                                        {item.fieldPeriod}
                                    </td>
                                    <td className="table__cell ">
                                        <ExternalLink text={"Interview"}
                                                      link={item.link}
                                                      ariaLabel={"Launch interview for instrument " + item.name + " " + item.fieldPeriod}/>
                                    </td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
                :
                <ONSPanel>
                    <p>{listError.message}</p>
                </ONSPanel>
        }
    </>;
}

export default InstrumentList;
