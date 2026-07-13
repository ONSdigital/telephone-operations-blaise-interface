import {fieldPeriodToText} from "../Functions";

describe("Field period to text test", () => {
    it("should return 'April 2020' for field period 2004", () => {
        expect(fieldPeriodToText("OPN2004")
        ).toBe("April 2020");
    });

    it("should return 'January 2020' for field period 2001", () => {
        expect(fieldPeriodToText("OPN2001")
        ).toBe("January 2020");
    });

    it("should return 'December 2020' for field period 2012", () => {
        expect(fieldPeriodToText("OPN2012")
        ).toBe("December 2020");
    });

    it("should return an unknown message if the survey is unrecognised", () => {
        expect(fieldPeriodToText("DST2022")
        ).toBe("Field period unknown");
    });

    it("should return an unknown message if the month is unrecognised", () => {
        expect(fieldPeriodToText("OPN20AB")
        ).toBe("Field period unknown");
    });
});
