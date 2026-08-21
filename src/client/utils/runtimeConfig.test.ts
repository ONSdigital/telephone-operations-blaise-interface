import { describe, expect, it } from "vitest";

import { getRuntimeAppConfig } from "./runtimeConfig";

describe("getRuntimeAppConfig", () => {
  it("returns parsed runtime values when app-config contains valid JSON", () => {
    document.body.innerHTML = `
      <script id="app-config" type="application/json">
        {"vmExternalClientUrl":"dev-tobi.example","catiDashboardUrl":"https://dev-cati.example/Blaise/CaseInfo"}
      </script>
    `;

    expect(getRuntimeAppConfig()).toStrictEqual({
      vmExternalClientUrl: "dev-tobi.example",
      catiDashboardUrl: "https://dev-cati.example/Blaise/CaseInfo",
    });
  });

  it("returns empty object when app-config is missing", () => {
    document.body.innerHTML = "";

    expect(getRuntimeAppConfig()).toStrictEqual({});
  });

  it("returns empty object for invalid JSON content", () => {
    document.body.innerHTML = `
      <script id="app-config" type="application/json">
        <%- typeof appConfigJson === 'string' ? appConfigJson : '' %>
      </script>
    `;

    expect(getRuntimeAppConfig()).toStrictEqual({});
  });
});
