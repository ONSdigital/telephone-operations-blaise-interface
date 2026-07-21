const listenMock = vi.fn();
const nodeServerMock = vi.fn(() => ({ listen: listenMock }));
const getEnvironmentVariablesMock = vi.fn(() => ({
  VM_EXTERNAL_CLIENT_URL: "external-client-url",
  VM_EXTERNAL_WEB_URL: "external-web-url",
  BLAISE_API_URL: "http://mock-api",
  CATI_DASHBOARD_URL: "https://external-cati-url/Blaise/CaseInfo",
  BIMS_CLIENT_ID: "mock@id",
  BIMS_API_URL: "mock-bims-api",
}));
const configMock = vi.fn();
const BlaiseApiClientMock = vi.fn();

vi.mock("./server.js", () => ({
  default: nodeServerMock,
}));

vi.mock("./Config.js", () => ({
  getEnvironmentVariables: getEnvironmentVariablesMock,
}));

vi.mock("dotenv", () => ({
  default: {
    config: configMock,
  },
}));

vi.mock("blaise-api-node-client", () => ({
  BlaiseApiClient: BlaiseApiClientMock,
}));

describe("server index bootstrap", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.PORT;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it("loads dotenv outside production and listens on provided port", async () => {
    process.env.NODE_ENV = "test";
    process.env.PORT = "5010";

    await import("./index");

    expect(configMock).toHaveBeenCalledTimes(1);
    expect(getEnvironmentVariablesMock).toHaveBeenCalledTimes(1);
    expect(BlaiseApiClientMock).toHaveBeenCalledWith("http://mock-api");
    expect(nodeServerMock).toHaveBeenCalledTimes(1);
    expect(listenMock).toHaveBeenCalledWith("5010");
  });

  it("skips dotenv in production and uses default port", async () => {
    process.env.NODE_ENV = "production";

    await import("./index");

    expect(configMock).not.toHaveBeenCalled();
    expect(listenMock).toHaveBeenCalledWith("5000");
  });
});
