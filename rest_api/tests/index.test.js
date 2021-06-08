import BlaiseApiRest from "../index";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

const blaiseApiRest = new BlaiseApiRest(`http://${process.env.BLAISE_API_URL}`);

describe("BlaiseApiRest", () => {
  describe("getAllInstrumentsWithCatiData", () => {
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

    beforeEach(() => {
      mock.onGet(`http://${process.env.BLAISE_API_URL}/api/v1/cati/instruments`).reply(200,
        apiInstrumentList,
      );
    });

    afterEach(() => {
      mock.reset();
    });

    it("returns a list of all instruments including CATI data", async done => {
      let instruments = await blaiseApiRest.getAllInstrumentsWithCatiData();

      expect(instruments).toEqual(apiInstrumentList);
      done();
    });
  });


  describe("getInstrumentsWithCatiData", () => {
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
    const serverpark = "test";

    beforeEach(() => {
      mock.onGet(`http://${process.env.BLAISE_API_URL}/api/v1/cati/serverparks/${serverpark}/instruments`).reply(200,
        apiInstrumentList,
      );
    });

    afterEach(() => {
      mock.reset();
    });

    it("returns a list of all instruments including CATI data within a serverpark", async done => {
      let instruments = await blaiseApiRest.getInstrumentsWithCatiData(serverpark);

      expect(instruments).toEqual(apiInstrumentList);
      done();
    });
  });

  describe("getInstrumentWithCatiData", () => {
    const apiInstrument = {
      activeToday: false,
      expired: false,
      installDate: "2020-12-11T11:53:55.5612856+00:00",
      name: "OPN2004A",
      serverParkName: "LocalDevelopment"
    };
    const serverpark = "test";

    beforeEach(() => {
      mock.onGet(`http://${process.env.BLAISE_API_URL}/api/v1/cati/serverparks/${serverpark}/instruments/${apiInstrument.name}`).reply(200,
        apiInstrument,
      );
    });

    afterEach(() => {
      mock.reset();
    });

    it("returns an instrument including CATI data", async done => {
      let instrument = await blaiseApiRest.getInstrumentWithCatiData(serverpark, apiInstrument.name);

      expect(instrument).toEqual(apiInstrument);
      done();
    });
  });

  describe("getInstruments", () => {
    const apiInstrumentList = [
      {
        expired: false,
        installDate: "2020-12-11T11:53:55.5612856+00:00",
        name: "OPN2007T",
        serverParkName: "LocalDevelopment"
      },
      {
        expired: false,
        installDate: "2020-12-11T11:53:55.5612856+00:00",
        name: "OPN2004A",
        serverParkName: "LocalDevelopment"
      }
    ];
    const serverpark = "test";

    beforeEach(() => {
      mock.onGet(`http://${process.env.BLAISE_API_URL}/api/v1/serverparks/${serverpark}/instruments`).reply(200,
        apiInstrumentList,
      );
    });

    afterEach(() => {
      mock.reset();
    });

    it("returns a list of instruments in a serverpark", async done => {
      let instruments = await blaiseApiRest.getInstruments(serverpark);

      expect(instruments).toEqual(apiInstrumentList);
      done();
    });
  });

  describe("getInstrument", () => {
    const apiInstrument = {
      expired: false,
      installDate: "2020-12-11T11:53:55.5612856+00:00",
      name: "OPN2004A",
      serverParkName: "LocalDevelopment"
    };
    const serverpark = "test";

    beforeEach(() => {
      mock.onGet(`http://${process.env.BLAISE_API_URL}/api/v1/serverparks/${serverpark}/instruments/${apiInstrument.name}`).reply(200,
        apiInstrument,
      );
    });

    afterEach(() => {
      mock.reset();
    });

    it("returns an instrument", async done => {
      let instrument = await blaiseApiRest.getInstrument(serverpark, apiInstrument.name);

      expect(instrument).toEqual(apiInstrument);
      done();
    });
  });

  describe("installInstrument", () => {
    const installInstrument = {
      instrumentName: "OPN2004A",
      instrumentFile: "OPN2004A.bpkg",
      bucketPath: "/"
    };
    const serverpark = "test";
    const apiInstallInstrumentResponse = {
      instrumentFile: "OPN2004A.bpkg"
    };

    beforeEach(() => {
      mock.onPost(`http://${process.env.BLAISE_API_URL}/api/v1/serverparks/${serverpark}/instruments`).reply(201,
        apiInstallInstrumentResponse,
      );
    });

    afterEach(() => {
      mock.reset();
    });

    it("installs an instrument and returns the instrument file", async done => {
      let instrument = await blaiseApiRest.installInstrument(serverpark, installInstrument);

      expect(instrument).toEqual(apiInstallInstrumentResponse);
      done();
    });
  });

  describe("deleteInstrument", () => {
    const serverpark = "test";
    const instrumentName = "OPN2004A";

    beforeEach(() => {
      mock.onDelete(`http://${process.env.BLAISE_API_URL}/api/v1/serverparks/${serverpark}/instruments/${instrumentName}?name=${instrumentName}`).reply(204,
        null,
      );
    });

    afterEach(() => {
      mock.reset();
    });

    it("deletes an instrument", async done => {
      let instrument = await blaiseApiRest.deleteInstrument(serverpark, instrumentName);

      expect(instrument).toBeNull();
      done();
    });
  });

  describe("getLiveDate", () => {
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


  describe("getDiagnostics", () => {
    const diagnosticsJSON = `[
      {
        "health check type": "Connection model",
          "status": "OK"
      },
      {
        "health check type": "Blaise connection",
          "status": "OK"
      },
      {
        "health check type": "Remote data server connection",
          "status": "OK"
      },
      {
        "health check type": "Remote Cati management connection",
          "status": "OK"
      }
    ]`;

    beforeAll(() => {
      mock.onGet("http://" + process.env.BLAISE_API_URL + "/api/v1/health/diagnosis").reply(200,
        diagnosticsJSON,
      );
    });

    afterAll(() => {
      mock.reset();
    });

    it("returns a list of diagnostics", async done => {
      let diagnostics = await blaiseApiRest.getDiagnostics();

      expect(diagnostics).toHaveLength(4);
      expect(diagnostics[0].status).toEqual("OK");
      expect(diagnostics[0]["health check type"]).toEqual("Connection model");
      done();
    });
  });
});
