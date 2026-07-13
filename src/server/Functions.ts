function isNumber(n: number | string) {
    return !isNaN(parseFloat(String(n))) && isFinite(Number(n));
}

function fieldPeriodFromInstrument(instrument_name: string): string {
    const month_number_str: string = instrument_name.substring(5, 7);
    let month_number_int = -1;
    let month = "Unknown";

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    if (isNumber(month_number_str)) {
        month_number_int = parseInt(month_number_str) - 1;
    } else {
        throw "Month was not a integer";
    }

    if (month_number_int >= 0 && month_number_int < 12) {
        month = monthNames[month_number_int];
    } else {
        throw "Month was dot between 1 and 12";
    }

    return month + " 20" + instrument_name.substring(3, 5);
}

export function fieldPeriodToText(instrument_name: string): string {
    try {
        return fieldPeriodFromInstrument(instrument_name);
    } catch (error: unknown) {
        console.error("Error getting field period");
        return "Field period unknown";
    }
}
