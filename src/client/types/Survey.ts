import { Questionnaire } from "blaise-api-node-client";

export interface Survey {
    survey: string;
    questionnaires: Questionnaire[];
}