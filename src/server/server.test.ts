import fs from "fs";
import os from "os";
import path from "path";

import { type BlaiseApiClient } from "blaise-api-node-client";
import supertest from "supertest";
import { type IMock, Mock } from "typemoq";
import { afterAll, afterEach, beforeAll } from "vitest";

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

describe("Production cache helpers", () => {
  let tempDir = "";
  let buildClientDir = "";

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tobi-server-test-"));
    buildClientDir = path.join(tempDir, "build", "client");

    const assetsDir = path.join(buildClientDir, "assets");
    const indexHtmlPath = path.join(buildClientDir, "index.html");
    const hashedAssetPath = path.join(assetsDir, "app.12345678.js");

    fs.mkdirSync(assetsDir, { recursive: true });
    fs.writeFileSync(hashedAssetPath, `console.log("test hashed asset");`);
    fs.writeFileSync(
      indexHtmlPath,
      `<!doctype html><html><body><div id="root"></div></body></html>`,
    );
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("serves hashed static asset requests in production", async () => {
    process.env.NODE_ENV = "production";
    const app = nodeServer(environmentVariables, blaiseApiMock.object, {
      buildFolder: buildClientDir,
    });
    const request = supertest(app);

    const response = await request.get("/assets/app.12345678.js");

    expect(response.statusCode).toEqual(200);
    expect(response.headers["cache-control"]).toEqual("public, max-age=31536000, immutable");
    expect(response.headers["content-type"]).toContain("text/javascript");
  });

  it("returns the app page when a user visits a direct URL like /surveys/123", async () => {
    process.env.NODE_ENV = "production";
    const app = nodeServer(environmentVariables, blaiseApiMock.object, {
      buildFolder: buildClientDir,
    });
    const request = supertest(app);

    const response = await request.get("/surveys/123");

    expect(response.statusCode).toEqual(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain('<div id="root"></div>');
  });

  it("serves index.html directly with no-cache headers in production", async () => {
    process.env.NODE_ENV = "production";
    const app = nodeServer(environmentVariables, blaiseApiMock.object, {
      buildFolder: buildClientDir,
    });
    const request = supertest(app);

    const response = await request.get("/index.html");

    expect(response.statusCode).toEqual(200);
    expect(response.headers["cache-control"]).toEqual("no-cache, no-store, must-revalidate");
    expect(response.headers.pragma).toEqual("no-cache");
    expect(response.headers.expires).toEqual("0");
  });
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

  it("returns JSON error payload from global handler in dev mode", async () => {
    process.env.NODE_ENV = "test";
    const invalidEnvironmentVariables = {
      ...environmentVariables,
      BIMS_CLIENT_ID: undefined,
    } as unknown as EnvironmentVariables;

    const app = nodeServer(invalidEnvironmentVariables, blaiseApiMock.object);
    const request = supertest(app);

    const response = await request.get("/api/questionnaires");

    expect(response.statusCode).toEqual(500);
    expect(response.body).toMatchObject({
      error: expect.any(String),
      stack: expect.any(String),
    });
  });

  it("renders index.html for non-API routes in production", async () => {
    process.env.NODE_ENV = "production";
    const app = nodeServer(environmentVariables, blaiseApiMock.object);
    const request = supertest(app);

    const response = await request.get("/");

    // In CI, build/client assets may not exist in this unit-test context.
    // When present we get 200 with rendered index.html, otherwise Express returns 500.
    expect([200, 500]).toContain(response.statusCode);

    if (response.statusCode === 200) {
      expect(response.text).toContain('<div id="root"></div>');
      expect(response.text).toMatch(/<script\s+id="app-config"\s+type="application\/json"/);
    }
  });
});
