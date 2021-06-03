import { Instrument } from "../rest_api";

interface Survey {
    instruments: Instrument[]
    survey: string
}

export type { Instrument, Survey };
