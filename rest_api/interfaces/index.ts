interface Instrument {
    installDate: string
    name: string
    expired?: boolean
    serverParkName: string
    activeToday?: boolean
    surveyDays?: string[]
    link?: string
    fieldPeriod: string
    surveyTLA?: string
    dataRecordCount?: number
    status?: string
    hasData?: boolean
    active?: boolean
}

interface InstallInstrument {
    instrumentName: string
    instrumentFile: string
    bucketPath: string
}

interface InstallInstrumentResponse {
    instrumentFile: string
}

interface Diagnostic {
    "health check type": string
    status: string
}

interface Survey {
    instruments: Instrument[]
    survey: string
}


export type { Instrument, InstallInstrument, InstallInstrumentResponse, Diagnostic, Survey };
