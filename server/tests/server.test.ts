/**
 * @jest-environment node
 */
import supertest from "supertest";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { IMock, Mock } from "typemoq";
import BlaiseApiClient, { Survey } from "blaise-api-node-client";
import nodeServer from "../server";
import { QuestionnaireHelper } from "./helpers/questionnaire-helper";
require("jest-extended");
jest.mock("../AuthProvider/GoogleTokenProvider");
const blaiseApiMock: IMock<BlaiseApiClient> = Mock.ofType(BlaiseApiClient);

const environmentVariables: EnvironmentVariables = {
    VM_EXTERNAL_CLIENT_URL: "external-client-url",
    VM_EXTERNAL_WEB_URL: "external-web-url",
    BLAISE_API_URL: "mock",
    CATI_DASHBOARD_URL: "internal-url",
    BIMS_CLIENT_ID: "mock@id",
    BIMS_API_URL: "mock-bims-api"
};

const app = nodeServer(environmentVariables, blaiseApiMock.object);
const request = supertest(app);

// This sets the mock adapter on the default instance
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

// Mock any GET request to /api/questionnaires
// arguments for reply are (status, data, headers)


describe("Given the API returns 2 instruments with only one that is active", () => {
    beforeAll(() => {
        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => apiQuestionnaireList);
        const liveDateUrl = new RegExp(`${environmentVariables.BIMS_API_URL}/tostartdate/.*`);
        mock.onGet(liveDateUrl).reply(200,
            { tostartdate: null },
            { "content-type": "application/json" }
        );
    });

    const apiQuestionnaireList = [
        QuestionnaireHelper.apiQuestionnaire("OPN2007T", true),
        QuestionnaireHelper.apiQuestionnaire("OPN2004A", false)];

    const questionnairesReturned = [
        {
            survey: "OPN",
            questionnaires: [QuestionnaireHelper.Questionnaire("OPN2007T", true, "July 2020", "OPN", "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large")]
        }
    ];

    it("should return a 200 status and a list with the one active instrument", async () => {
        // act        
        const response = await request.get("/api/questionnaires");

        // assert
        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].questionnaires).toHaveLength(1);
        expect(response.body).toIncludeSameMembers(questionnairesReturned);
    });

    afterAll(() => {
        mock.reset();
    });

    afterEach(() => {
        blaiseApiMock.reset();
        jest.resetAllMocks();
    });
});

describe("Given the API returns 2 active instruments for the survey OPN", () => {
    beforeAll(() => {
        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => apiQuestionnaireList);

        const liveDateUrl = new RegExp(`${process.env.BIMS_API_URL}/tostartdate/.*`);
        mock.onGet(liveDateUrl).reply(200,
            { tostartdate: null },
            { "content-type": "application/json" }
        );
    });

    const apiQuestionnaireList = [
        QuestionnaireHelper.apiQuestionnaire("OPN2007T", true),
        QuestionnaireHelper.apiQuestionnaire("OPN2004A", true)];

    const questionnairesReturned = [
        {
            survey: "OPN",
            questionnaires: [
                QuestionnaireHelper.Questionnaire("OPN2007T", true, "July 2020", "OPN", "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large"),
                QuestionnaireHelper.Questionnaire("OPN2004A", true, "April 2020", "OPN", "https://external-web-url/OPN2004A?LayoutSet=CATI-Interviewer_Large")]
        }
    ];

    it("should return a list with one survey with 2 instrument objects", async () => {
        // act    
        const response = await request.get("/api/questionnaires");

        // arrange
        expect(response.statusCode).toEqual(200);

        // assert
        expect(response.body).toHaveLength(1);

        expect(response.body[0].questionnaires).toHaveLength(2);
        expect(response.body[0].survey).toEqual(questionnairesReturned[0].survey);
        expect(response.body[0].questionnaires).toIncludeSameMembers(questionnairesReturned[0].questionnaires);
    });

    afterAll(() => {
        mock.reset();
    });

    afterEach(() => {
        blaiseApiMock.reset();
        jest.resetAllMocks();
    });
});

describe("Given the API returns 2 active instruments for 2 separate surveys ", () => {
    beforeAll(() => {
        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => apiQuestionnaireList);

        const liveDateUrl = new RegExp(`${process.env.BIMS_API_URL}/tostartdate/.*`);
        mock.onGet(liveDateUrl).reply(200,
            { tostartdate: null },
            { "content-type": "application/json" }
        );
    });

    const apiQuestionnaireList = [
        QuestionnaireHelper.apiQuestionnaire("IPS2007T", true),
        QuestionnaireHelper.apiQuestionnaire("OPN2004A", true)];

    const questionnairesReturned = [
        {
            survey: "IPS",
            questionnaires: [QuestionnaireHelper.Questionnaire("IPS2007T", true, "July 2020", "IPS", "https://external-web-url/IPS2007T?LayoutSet=CATI-Interviewer_Large")]
        },
        {
            survey: "OPN",
            questionnaires: [QuestionnaireHelper.Questionnaire("OPN2004A", true, "April 2020", "OPN", "https://external-web-url/OPN2004A?LayoutSet=CATI-Interviewer_Large")]
        }];

    it("should return a list with 2 surveys with instrument object in each", async () => {
        // act
        const response = await request.get("/api/questionnaires");

        // assert
        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveLength(2);

        expect(response.body[0].questionnaires).toHaveLength(1);
        expect(response.body[1].questionnaires).toHaveLength(1);
        expect(response.body).toIncludeSameMembers(questionnairesReturned);
    });

    afterAll(() => {
        mock.reset();
    });

    afterEach(() => {
        blaiseApiMock.reset();
        jest.resetAllMocks();
    });
});


describe("Get list of instruments endpoint fails", () => {
    beforeAll(() => {
        blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).throws(new Error());
        const liveDateUrl = new RegExp(`${process.env.BIMS_API_URL}/tostartdate/.*`);
        mock.onGet(liveDateUrl).reply(200,
            { tostartdate: null },
            { "content-type": "application/json" }
        );
    });

    it("should return a 500 status and an error message", async () => {
        const response = await request.get("/api/questionnaires");

        expect(response.statusCode).toEqual(500);
    });

    afterAll(() => {
        mock.reset();
    });

    afterEach(() => {
        blaiseApiMock.reset();
        jest.resetAllMocks();
    });
});

import { defineFeature, loadFeature, DefineStepFunction } from "jest-cucumber";
import { IsoDateHelper } from "./helpers/iso-date-helper";
import { EnvironmentVariables } from "../Config";


const feature = loadFeature("./src/features/TO_Interviewer_Happy_Path.feature", { tagFilter: "@server" });

defineFeature(feature, test => {
    //Scenario 3b
    let response: Survey[];
    const liveDateUrl = new RegExp(`${process.env.BIMS_API_URL}/tostartdate/.*`);
    const questionnaireName = "OPN2007T";

    const questionnaireHasATelOpsStartDateOfToday = (given: DefineStepFunction) => {
        given("a survey questionnaire has a TelOps start date of today", async () => {
            mock.onGet(liveDateUrl).reply(200, { tostartdate: IsoDateHelper.today() }, { "content-type": "application/json" });
        });
    };

    const questionnaireHasATelOpsStartDateInThePast = (given: DefineStepFunction) => {
        given("a survey questionnaire has a TelOps start date in the past", async () => {
            mock.onGet(liveDateUrl).reply(200, { tostartdate: IsoDateHelper.yesterday() }, { "content-type": "application/json" });
        });
    };

    const questionnaireHasATelOpsStartDateInTheFuture = (given: DefineStepFunction) => {
        given("a survey questionnaire has a TelOps start date is in the future", async () => {
            mock.onGet(liveDateUrl).reply(200, { tostartdate: IsoDateHelper.tomorrow() }, { "content-type": "application/json" });
        });
    };

    const questionnaireDoesNotHaveATelOpsStartDate = (given: DefineStepFunction) => {
        given("a survey questionnaire does not have a TelOps start date", async () => {
            mock.onGet(liveDateUrl).reply(404, null, { "content-type": "application/json" });
        }
        );
    };

    const questionnaireHasAnActiveSurveyDay = (given: DefineStepFunction) => {
        given("an active survey day", async () => {
            const apiQuestionnaireList = [QuestionnaireHelper.apiQuestionnaire(questionnaireName, true)];

            blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => apiQuestionnaireList);
        });
    };

    const questionnaireDoesNotHaveAnActiveSurveyDay = (given: DefineStepFunction) => {
        given("does not have an active survey day", async () => {
            const apiQuestionnaireList = [QuestionnaireHelper.apiQuestionnaire(questionnaireName, false)];

            blaiseApiMock.setup((api) => api.getAllQuestionnairesWithCatiData()).returns(async () => apiQuestionnaireList);
        });
    };

    const iSelectTheSurveyIAmWorkingOn = (when: DefineStepFunction) => {
        when("I select the survey I am working on", async () => {
            response = (await request.get("/api/questionnaires")).body;
        });
    };

    const thenIWillSeeTheQuestionnaireListed = (then: DefineStepFunction) => {
        then("I will see that questionnaire listed for the survey", () => {
            // The survey is returned
            const selectedSurvey = response[0].questionnaires;
            expect(selectedSurvey).toHaveLength(1);

            const questionnaireListReturned = [QuestionnaireHelper.Questionnaire(
                questionnaireName, true, "July 2020", "OPN", "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large")];

            expect(selectedSurvey).toEqual(questionnaireListReturned);
        });
    };

    const thenIWillNotSeeTheQuestionnaireListed = (then: DefineStepFunction) => {
        then("I will not see that questionnaire listed for the survey", () => {
            // The questionnaire is not returned
            expect(response).toEqual([]);
        });
    };

    test("Show surveys that have a TelOps start date of today and an active survey day in TOBI", ({ given, and, when, then }) => {
        questionnaireHasATelOpsStartDateOfToday(given);
        questionnaireHasAnActiveSurveyDay(and);
        iSelectTheSurveyIAmWorkingOn(when);
        thenIWillSeeTheQuestionnaireListed(then);
    });

    test("Show surveys that have a TelOps start date in the past and an active survey day in TOBI", ({ given, and, when, then }) => {
        questionnaireHasATelOpsStartDateInThePast(given);
        questionnaireHasAnActiveSurveyDay(and);
        iSelectTheSurveyIAmWorkingOn(when);
        thenIWillSeeTheQuestionnaireListed(then);
    });

    test("Do not show surveys that have an active survey day but TelOps start date in the future in TOBI", ({ given, and, when, then }) => {
        questionnaireHasATelOpsStartDateInTheFuture(given);
        questionnaireHasAnActiveSurveyDay(and);
        iSelectTheSurveyIAmWorkingOn(when);
        thenIWillNotSeeTheQuestionnaireListed(then);
    });

    test("Do not show surveys that have a TelOps start date in the past but no active survey day in TOBI", ({ given, and, when, then }) => {
        questionnaireHasATelOpsStartDateInThePast(given);
        questionnaireDoesNotHaveAnActiveSurveyDay(and);
        iSelectTheSurveyIAmWorkingOn(when);
        thenIWillNotSeeTheQuestionnaireListed(then);
    });

    test("Show surveys that do not have a TelOps start date but have an active survey day in TOBI", ({ given, and, when, then }) => {
        questionnaireDoesNotHaveATelOpsStartDate(given);
        questionnaireHasAnActiveSurveyDay(and);
        iSelectTheSurveyIAmWorkingOn(when);
        thenIWillSeeTheQuestionnaireListed(then);
    });

    test("Do not show surveys that do not have a TelOps start date and do not have an active survey day in TOBI", ({ given, and, when, then }) => {
        questionnaireDoesNotHaveATelOpsStartDate(given);
        questionnaireDoesNotHaveAnActiveSurveyDay(and);
        iSelectTheSurveyIAmWorkingOn(when);
        thenIWillNotSeeTheQuestionnaireListed(then);
    });
});
