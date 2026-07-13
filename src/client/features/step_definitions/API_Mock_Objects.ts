import type { Survey } from "../../types/Survey";

export const survey_list_with_OPN_and_LMS_with_one_active_instrument_each: Survey[] = [
  {
    survey: "OPN",
    questionnaires: [
      {
        fieldPeriod: "July 2020",
        installDate: "2020-12-11T11:53:55.5612856+00:00",
        link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
        name: "OPN2007T",
        serverParkName: "LocalDevelopment",
        surveyTla: "OPN",
      },
    ],
  },
  {
    survey: "LMS",
    questionnaires: [
      {
        fieldPeriod: "Unknown",
        installDate: "2020-12-11T11:53:55.5612856+00:00",
        link: "https://external-web-url/LMSSurvey01?LayoutSet=CATI-Interviewer_Large",
        name: "LMSSurvey01",
        serverParkName: "LocalDevelopment",
        surveyTla: "LMS",
      },
    ],
  },
];

// const survey_list_with_OPN_with_one_active_instrument: Survey[] = [
//   {
//     survey: "OPN",
//     questionnaires: [
//       {
//         fieldPeriod: "July 2020",
//         installDate: "2020-12-11T11:53:55.5612856+00:00",
//         link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
//         name: "OPN2007T",
//         serverParkName: "LocalDevelopment",
//         surveyTla: "OPN",
//       },
//     ],
//   },
// ];

export const survey_list_with_OPN_with_two_active_instruments: Survey[] = [
  {
    survey: "OPN",
    questionnaires: [
      {
        fieldPeriod: "July 2020",
        installDate: "2020-12-10T11:53:55.5612856+00:00",
        link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
        name: "OPN2007T",
        serverParkName: "LocalDevelopment",
        surveyTla: "OPN",
      },
      {
        fieldPeriod: "April 2020",
        installDate: "2020-12-11T11:53:55.5612856+00:00",
        link: "https://external-web-url/OPN2004A?LayoutSet=CATI-Interviewer_Large",
        name: "OPN2004A",
        serverParkName: "LocalDevelopment",
        surveyTla: "OPN",
      },
    ],
  },
];

export const survey_list_with_OPN_with_three_active_instruments: Survey[] = [
  {
    survey: "OPN",
    questionnaires: [
      {
        fieldPeriod: "July 2020",
        installDate: "2020-12-10T11:53:55.5612856+00:00",
        link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
        name: "OPN2007T",
        serverParkName: "LocalDevelopment",
        surveyTla: "OPN",
      },
      {
        fieldPeriod: "January 2021",
        installDate: "2020-12-12T11:53:55.5612856+00:00",
        link: "https://external-web-url/OPN2101A?LayoutSet=CATI-Interviewer_Large",
        name: "OPN2101A",
        serverParkName: "LocalDevelopment",
        surveyTla: "OPN",
      },
      {
        fieldPeriod: "April 2020",
        installDate: "2020-12-11T11:53:55.5612856+00:00",
        link: "https://external-web-url/OPN2004A?LayoutSet=CATI-Interviewer_Large",
        name: "OPN2004A",
        serverParkName: "LocalDevelopment",
        surveyTla: "OPN",
      },
    ],
  },
];
