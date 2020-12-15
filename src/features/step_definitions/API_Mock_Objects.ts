import { Survey } from "../../../Interfaces";

export const survey_list_with_OPN_and_LMS_with_one_active_instrument_each: Survey[] = [
    {
        survey: "OPN",
        instruments: [
            {
                activeToday: true,
                fieldPeriod: "July 2020",
                expired: false,
                installDate: "2020-12-11T11:53:55.5612856+00:00",
                link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
                name: "OPN2007T",
                serverParkName: "LocalDevelopment",
                surveyTLA: "OPN",
                surveyDays: []
            }
        ]
    },
    {
        survey: "LMS",
        instruments: [
            {
                activeToday: true,
                fieldPeriod: "Unknown",
                expired: false,
                installDate: "2020-12-11T11:53:55.5612856+00:00",
                link: "https://external-web-url/LMSSurvey01?LayoutSet=CATI-Interviewer_Large",
                name: "LMSSurvey01",
                serverParkName: "LocalDevelopment",
                surveyTLA: "LMS",
                surveyDays: []
            }
        ]
    }
];

export const survey_list_with_OPN_with_one_active_instrument: Survey[] = [
    {
        survey: "OPN",
        instruments: [
            {
                activeToday: true,
                fieldPeriod: "July 2020",
                expired: false,
                installDate: "2020-12-11T11:53:55.5612856+00:00",
                link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
                name: "OPN2007T",
                serverParkName: "LocalDevelopment",
                surveyTLA: "OPN",
                surveyDays: []
            }
        ]
    }
];

export const survey_list_with_OPN_with_two_active_instruments: Survey[] = [
    {
        survey: "OPN",
        instruments: [
            {
                activeToday: true,
                fieldPeriod: "July 2020",
                expired: false,
                installDate: "2020-12-10T11:53:55.5612856+00:00",
                link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
                name: "OPN2007T",
                serverParkName: "LocalDevelopment",
                surveyTLA: "OPN",
                surveyDays: []
            },
            {
                activeToday: true,
                fieldPeriod: "April 2020",
                expired: false,
                installDate: "2020-12-11T11:53:55.5612856+00:00",
                link: "https://external-web-url/OPN2004A?LayoutSet=CATI-Interviewer_Large",
                name: "OPN2004A",
                serverParkName: "LocalDevelopment",
                surveyTLA: "OPN",
                surveyDays: []
            }
        ]
    }
];

export const survey_list_with_OPN_with_three_active_instruments: Survey[] = [
    {
        survey: "OPN",
        instruments: [
            {
                activeToday: true,
                fieldPeriod: "July 2020",
                expired: false,
                installDate: "2020-12-10T11:53:55.5612856+00:00",
                link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
                name: "OPN2007T",
                serverParkName: "LocalDevelopment",
                surveyTLA: "OPN",
                surveyDays: []
            },
            {
                activeToday: true,
                fieldPeriod: "January 2021",
                expired: false,
                installDate: "2020-12-12T11:53:55.5612856+00:00",
                link: "https://external-web-url/OPN2101A?LayoutSet=CATI-Interviewer_Large",
                name: "OPN2101A",
                serverParkName: "LocalDevelopment",
                surveyTLA: "OPN",
                surveyDays: []
            },
            {
                activeToday: true,
                fieldPeriod: "April 2020",
                expired: false,
                installDate: "2020-12-11T11:53:55.5612856+00:00",
                link: "https://external-web-url/OPN2004A?LayoutSet=CATI-Interviewer_Large",
                name: "OPN2004A",
                serverParkName: "LocalDevelopment",
                surveyTLA: "OPN",
                surveyDays: []
            },
        ]
    }
];
