import Functions from "../Functions";

describe("Field period to text test", () => {
    it("should return the OPN_field_period", () => {
        expect(Functions.field_period_to_text("OPN2004")
        ).toBe("May 2020");
    });

    it("should return an unknown message if the survey is unrecognised", () => {
        expect(Functions.field_period_to_text("DST2008")
        ).toBe("Field period unknown");
    });

     it("should return an unknown message if the month is unrecognised", () => {
        expect(Functions.field_period_to_text("OPN20AB")
        ).toBe("Unknown 2020");
    });
});







