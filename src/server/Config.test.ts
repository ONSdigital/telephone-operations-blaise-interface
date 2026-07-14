import { getEnvironmentVariables } from "../Config";

const originalEnv = process.env;

describe("Config setup", () => {
  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it("should return the correct environment variables", () => {
    const {
      VM_EXTERNAL_CLIENT_URL,
      VM_EXTERNAL_WEB_URL,
      BLAISE_API_URL,
      CATI_DASHBOARD_URL,
      BIMS_CLIENT_ID,
      BIMS_API_URL,
    } = getEnvironmentVariables();

    expect(VM_EXTERNAL_CLIENT_URL).toBe("external-client-url");
    expect(VM_EXTERNAL_WEB_URL).toBe("external-web-url");
    expect(BLAISE_API_URL).toBe("http://mock");
    expect(CATI_DASHBOARD_URL).toBe("https://external-web-url/Blaise/CaseInfo");
    expect(BIMS_CLIENT_ID).toBe("mock@id");
    expect(BIMS_API_URL).toBe("mock-bims-api");
  });

  it("should return variables with default string if variables are not defined", () => {
    process.env = {
      ...originalEnv,
      VM_EXTERNAL_CLIENT_URL: undefined,
      VM_EXTERNAL_WEB_URL: undefined,
      BLAISE_API_URL: undefined,
      BIMS_CLIENT_ID: undefined,
      BIMS_API_URL: undefined,
      VM_INTERNAL_URL: undefined,
    };

    const {
      VM_EXTERNAL_CLIENT_URL,
      VM_EXTERNAL_WEB_URL,
      BLAISE_API_URL,
      CATI_DASHBOARD_URL,
      BIMS_CLIENT_ID,
      BIMS_API_URL,
    } = getEnvironmentVariables();

    expect(VM_EXTERNAL_CLIENT_URL).toBe("ENV_VAR_NOT_SET");
    expect(VM_EXTERNAL_WEB_URL).toBe("ENV_VAR_NOT_SET");
    expect(BLAISE_API_URL).toBe("ENV_VAR_NOT_SET");
    expect(CATI_DASHBOARD_URL).toBe("https://undefined/Blaise/CaseInfo");
    expect(BIMS_CLIENT_ID).toBe("ENV_VAR_NOT_SET");
    expect(BIMS_API_URL).toBe("ENV_VAR_NOT_SET");
  });
});
