import BlaiseApiRest from "../index";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

const blaiseApiRest = new BlaiseApiRest(`http://${process.env.BLAISE_API_URL}`);

describe("BlaiseApiRest", () => {
  describe("getInstruments", () => {
    const apiInstrumentList = [
      {
        activeToday: true,
        expired: false,
        installDate: "2020-12-11T11:53:55.5612856+00:00",
        name: "OPN2007T",
        serverParkName: "LocalDevelopment"
      },
      {
        activeToday: false,
        expired: false,
        installDate: "2020-12-11T11:53:55.5612856+00:00",
        name: "OPN2004A",
        serverParkName: "LocalDevelopment"
      }
    ];

    beforeAll(() => {
      mock.onGet("http://" + process.env.BLAISE_API_URL + "/api/v1/cati/instruments").reply(200,
        apiInstrumentList,
      );
    });

    afterAll(() => {
      mock.reset();
    });

    it("returns a list of all instruments", async done => {
      let instruments = await blaiseApiRest.getInstruments();

      expect(instruments).toEqual(apiInstrumentList);
      done();
    });
  });

  describe("getLiveData", () => {
    let liveDate = null;

    const instrument = {
      activeToday: true,
      expired: false,
      installDate: "2020-12-11T11:53:55.5612856+00:00",
      name: "OPN2007T",
      serverParkName: "LocalDevelopment"
    };

    beforeEach(() => {
      mock.onGet(`http://${process.env.BLAISE_API_URL}/api/v1/serverparks/LocalDevelopment/instruments/OPN2007T/liveDate`).reply(200,
        liveDate,
      );
    });

    afterEach(() => {
      mock.reset();
    });

    describe("when live date is null", () => {
      beforeAll(() => {
        liveDate = null;
      });

      it("returns null", async done => {
        const liveDate = await blaiseApiRest.getLiveDate(instrument);

        expect(liveDate).toBeNull();
        done();
      });
    });

    describe("when live date is a valid date", () => {
      beforeAll(() => {
        liveDate = "2021-06-03T00:00:00";
      });

      it("returns a parsed date as unix timestamp", async done => {
        const liveDate = await blaiseApiRest.getLiveDate(instrument);

        expect(liveDate).toEqual(1622674800000);
        done();
      });
    });

    describe("when live date is an invalid date", () => {
      beforeAll(() => {
        liveDate = "skjdhasjkhdushk";
      });

      it("returns NaN", async done => {
        const liveDate = await blaiseApiRest.getLiveDate(instrument);

        expect(liveDate).toEqual(NaN);
        done();
      });
    });
  });
});
