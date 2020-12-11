interface Instrument {
    installDate: string
    name: string
    serverParkName: string
    activeToday: boolean
    surveyDays: string[]
    link: string
    fieldPeriod: string
    surveyTLA: string
}

interface Survey {
    instruments: Instrument[]
    survey: string
}

export type {Instrument, Survey};
