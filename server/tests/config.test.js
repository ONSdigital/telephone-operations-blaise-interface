import {getEnvironmentVariables} from "../Config";

describe("Config setup", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });




    it("should return the correct environment variables", () => {
        const {VM_EXTERNAL_CLIENT_URL, VM_EXTERNAL_WEB_URL, BLAISE_API_URL, CATI_DASHBOARD_URL} = getEnvironmentVariables();


        expect(VM_EXTERNAL_CLIENT_URL).toBe("external-client-url");
        expect(VM_EXTERNAL_WEB_URL).toBe("external-web-url");
        expect(BLAISE_API_URL).toBe("mock");
        expect(CATI_DASHBOARD_URL).toBe("https://external-web-url/Blaise");
    });

    it("should return variables with default string if variables are not defined", () => {
        process.env = Object.assign({
            VM_EXTERNAL_CLIENT_URL: undefined,
            VM_EXTERNAL_WEB_URL: undefined,
            BLAISE_API_URL: undefined,
            VM_INTERNAL_URL: undefined,
        });

        const {VM_EXTERNAL_CLIENT_URL, VM_EXTERNAL_WEB_URL, BLAISE_API_URL, CATI_DASHBOARD_URL} = getEnvironmentVariables();


        expect(VM_EXTERNAL_CLIENT_URL).toBe("ENV_VAR_NOT_SET");
        expect(VM_EXTERNAL_WEB_URL).toBe("ENV_VAR_NOT_SET");
        expect(BLAISE_API_URL).toBe("ENV_VAR_NOT_SET");
        expect(CATI_DASHBOARD_URL).toBe("https://undefined/Blaise");
    });
});
