import { type BlaiseApiClient } from "blaise-api-node-client";
import supertest from "supertest";
import { type IMock, Mock } from "typemoq";
import { afterEach } from "vitest";

import { type EnvironmentVariables } from "./Config";
import nodeServer from "./server";

const blaiseApiMock: IMock<BlaiseApiClient> = Mock.ofType<BlaiseApiClient>();
const environmentVariables: EnvironmentVariables = {
  VM_EXTERNAL_CLIENT_URL: "external-client-url",
  VM_EXTERNAL_WEB_URL: "external-web-url",
  BLAISE_API_URL: "mock",
  CATI_DASHBOARD_URL: "internal-url",
  BIMS_CLIENT_ID: "mock@id",
  BIMS_API_URL: "mock-bims-api",
};

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

describe("Test Health Endpoint", () => {
  it("should return a 200 status and json message", async () => {
    const app = nodeServer(environmentVariables, blaiseApiMock.object);
    const request = supertest(app);
    const response = await request.get("/tobi-ui/version/health");

    expect(response.statusCode).toEqual(200);
    expect(response.body).toStrictEqual({ healthy: true });
  });

  it("returns dev-mode hint for non-API routes", async () => {
    process.env.NODE_ENV = "test";
    const app = nodeServer(environmentVariables, blaiseApiMock.object);
    const request = supertest(app);

    const response = await request.get("/not-a-real-route");

    expect(response.statusCode).toEqual(404);
    expect(response.body).toStrictEqual({
      message: "UI is served on http://localhost:3000",
      hint: "This server (port 5000) only handles /api routes in development",
    });
  });

  it("renders index.html for non-API routes in production", async () => {
    process.env.NODE_ENV = "production";
    const app = nodeServer(environmentVariables, blaiseApiMock.object);
    const request = supertest(app);

    const response = await request.get("/");

    expect(response.statusCode).toEqual(200);
    expect(response.text).toContain('<div id="root"></div>');
    expect(response.text).toMatch(/<script\s+id="app-config"\s+type="application\/json"/);
  });
});
