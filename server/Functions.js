function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function field_period_to_text(field_period) {
    let month_number_str = field_period.substr(5, 2);
    let month_number_int = -1;
    let month = "Unknown";

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    if(isNumber(month_number_str)) {
        month_number_int = parseInt(month_number_str);
    }

    if(month_number_int > 0 && month_number_int < 13) {
        month = monthNames[month_number_int];
    }

    return month + " 20" + field_period.substr(3, 2);
}

module.exports = { field_period_to_text };
