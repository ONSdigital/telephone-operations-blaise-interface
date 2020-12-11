function isNumber(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function OPN_field_period_generation(instrument_name: string): string {
    const month_number_str: string = instrument_name.substr(5, 2);
    let month_number_int = -1;
    let month = "Unknown";

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    if (isNumber(month_number_str)) {
        month_number_int = parseInt(month_number_str)-1;
    }

    if (month_number_int >= 0 && month_number_int < 12) {
        month = monthNames[month_number_int];
    }

    return month + " 20" + instrument_name.substr(3, 2);
}

function field_period_to_text(instrument_name: string) : string {
    const survey_tla: string = instrument_name.substr(0, 3);

    if (survey_tla === "OPN") {
        return OPN_field_period_generation(instrument_name);
    } else {
        return "Field period unknown";
    }

}

export default {field_period_to_text};
