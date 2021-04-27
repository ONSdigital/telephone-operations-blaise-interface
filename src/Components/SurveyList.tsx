import { ONSPanel } from "blaise-design-system-react-components";
import React, {ReactElement} from "react";
import {Link} from "react-router-dom";
import {Survey} from "../../Interfaces";

interface listError {
    error: boolean,
    message: string
}

interface Props {
    list: Survey[],
    listError: listError
}

function SurveyList(props: Props): ReactElement {
    const {list, listError} = props;

    return <>
        <h2>Surveys</h2>
        {
            list && list.length > 0
                ?
                <table id="survey-table" className="table ">
                    <thead className="table__head u-mt-m">
                    <tr className="table__row">
                        <th scope="col" className="table__header ">
                            <span>Survey three letter acronym</span>
                        </th>
                        <th scope="col" className="table__header ">
                            <span>Link to questionnaires</span>
                        </th>
                    </tr>
                    </thead>
                    <tbody className="table__body">
                    {
                        list.map((item: Survey) => {
                            return (
                                <tr className="table__row" key={item.survey} data-testid={"survey-table-row"}>
                                    <td className="table__cell ">
                                        {item.survey}
                                    </td>
                                    <td className="table__cell ">
                                        <Link to={"/survey/" + item.survey}>View active questionnaires</Link>
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

export default SurveyList;
