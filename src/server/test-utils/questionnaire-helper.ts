import type { Questionnaire } from "blaise-api-node-client";

export class QuestionnaireHelper {
  public static apiQuestionnaire(name: string, activeToday: boolean): Questionnaire {
    return {
      activeToday: activeToday,
      installDate: "2020-12-11T11:53:55.5612856+00:00",
      name: name,
      serverParkName: "LocalDevelopment",
    } as Questionnaire;
  }

  public static Questionnaire(
    name: string,
    activeToday: boolean,
    fieldPeriod: string,
    survey: string,
    link: string,
  ): Questionnaire {
    return {
      activeToday: activeToday,
      fieldPeriod: fieldPeriod,
      installDate: "2020-12-11T11:53:55.5612856+00:00",
      link: link,
      name: name,
      serverParkName: "LocalDevelopment",
      surveyTla: survey,
    } as Questionnaire;
  }
}
