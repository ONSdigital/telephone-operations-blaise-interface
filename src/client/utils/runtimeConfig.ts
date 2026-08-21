export interface RuntimeAppConfig {
  vmExternalClientUrl?: string;
  catiDashboardUrl?: string;
}

export function getRuntimeAppConfig(): RuntimeAppConfig {
  const configElement = document.getElementById("app-config");

  if (!configElement) {
    return {};
  }

  const text = configElement.textContent?.trim();

  if (!text) {
    return {};
  }

  try {
    const parsed = JSON.parse(text) as Partial<RuntimeAppConfig>;

    return {
      vmExternalClientUrl:
        typeof parsed.vmExternalClientUrl === "string" ? parsed.vmExternalClientUrl : undefined,
      catiDashboardUrl:
        typeof parsed.catiDashboardUrl === "string" ? parsed.catiDashboardUrl : undefined,
    };
  } catch {
    // In dev, index.html can contain an unevaluated EJS placeholder.
    return {};
  }
}
