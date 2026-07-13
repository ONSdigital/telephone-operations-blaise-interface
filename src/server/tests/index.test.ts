import { type BlaiseApiClient } from "blaise-api-node-client";
import supertest from "supertest";
import { type IMock, Mock } from "typemoq";

import { type EnvironmentVariables } from "../Config";
import nodeServer from "../server";

const blaiseApiMock: IMock<BlaiseApiClient> = Mock.ofType<BlaiseApiClient>();
const environmentVariables: EnvironmentVariables = {
  VM_EXTERNAL_CLIENT_URL: "external-client-url",
  VM_EXTERNAL_WEB_URL: "external-web-url",
  BLAISE_API_URL: "mock",
  CATI_DASHBOARD_URL: "internal-url",
  BIMS_CLIENT_ID: "mock@id",
  BIMS_API_URL: "mock-bims-api",
};

const app = nodeServer(environmentVariables, blaiseApiMock.object);

const request = supertest(app);

describe("Test Health Endpoint", () => {
  it("should return a 200 status and json message", async () => {
    const response = await request.get("/tobi-ui/version/health");

    expect(response.statusCode).toEqual(200);
    expect(response.body).toStrictEqual({ healthy: true });
  });
});
