import { ErrorPanel, ExternalLink } from "blaise-design-system-react-components";
import React from "react";
import { Link, useParams } from "react-router-dom";

import type { Survey } from "../../types/Survey";
import type { Questionnaire } from "blaise-api-node-client";
import type { ReactElement } from "react";

interface listError {
  error: boolean;
  message: string;
}

interface Props {
  list: Survey[];
  listError: listError;
}

function InstrumentList(props: Props): ReactElement {
  const { list, listError }: Props = props;
  const { survey } = useParams<string>();

  const filteredSurvey: Survey[] = list.filter((obj: Survey) => {
    return obj.survey === survey;
  });

  let surveyInstruments: Questionnaire[] = [];

  if (filteredSurvey.length === 1) {
    surveyInstruments = filteredSurvey[0].questionnaires;
  } else if (filteredSurvey.length !== 1) {
    listError.message = "No active questionnaires for survey " + survey;
  } else {
    listError.message = "Unable to load questionnaires for survey " + survey;
  }

  surveyInstruments.sort(
    (a: Questionnaire, b: Questionnaire) => Date.parse(b.installDate) - Date.parse(a.installDate),
  );

  return (
    <>
      <p>
        <Link
          to={"/"}
          id={"return-to-survey-list"}
        >
          Return to survey list
        </Link>
      </p>

      <h2>Active questionnaires</h2>
      {surveyInstruments && surveyInstruments.length > 0 ? (
        <table
          id="instrument-table"
          className="ons-table "
        >
          <thead className="ons-table__head ons-u-mt-m">
            <tr className="ons-table__row">
              <th
                scope="col"
                className="ons-table__header "
              >
                <span>Questionnaire</span>
              </th>
              <th
                scope="col"
                className="ons-table__header "
              >
                <span>Field period</span>
              </th>
              <th
                scope="col"
                className="ons-table__header "
              >
                <span>Link to interview</span>
              </th>
            </tr>
          </thead>
          <tbody className="ons-table__body">
            {surveyInstruments.map((item: Questionnaire) => {
              return (
                <tr
                  className="ons-table__row"
                  key={item.name}
                  data-testid={"instrument-table-row"}
                >
                  <td className="ons-table__cell ">{item.name}</td>
                  <td className="ons-table__cell ">{item.fieldPeriod}</td>
                  <td className="ons-table__cell ">
                    <ExternalLink
                      text={"Interview"}
                      link={item.link ?? ""}
                      ariaLabel={
                        "Launch interview for instrument " + item.name + " " + item.fieldPeriod
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <ErrorPanel text={listError.message} />
      )}
    </>
  );
}

export default InstrumentList;
