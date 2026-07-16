export interface EnvironmentVariables {
  VM_EXTERNAL_CLIENT_URL: string;
  VM_EXTERNAL_WEB_URL: string;
  BLAISE_API_URL: string;
  CATI_EXTERNAL_URL?: string;
  CATI_DASHBOARD_URL: string;
  BIMS_CLIENT_ID: string;
  BIMS_API_URL: string;
}

export function getEnvironmentVariables(): EnvironmentVariables {
  let {
    VM_EXTERNAL_CLIENT_URL,
    VM_EXTERNAL_WEB_URL,
    BLAISE_API_URL,
    CATI_EXTERNAL_URL,
    BIMS_CLIENT_ID,
    BIMS_API_URL,
  } = process.env;

  let CATI_DASHBOARD_URL: string;
  if (CATI_EXTERNAL_URL) {
    // If CATI_EXTERNAL_URL is provided by Terraform, use it as the base
    CATI_DASHBOARD_URL = CATI_EXTERNAL_URL.endsWith('/')
      ? CATI_EXTERNAL_URL + "Blaise/CaseInfo"
      : CATI_EXTERNAL_URL + "/Blaise/CaseInfo";
  } else {
    // Fallback to constructing from VM_EXTERNAL_WEB_URL and replace tobi with cati if needed
    const catiUrl = VM_EXTERNAL_WEB_URL ? VM_EXTERNAL_WEB_URL.replace(/tobi/gi, "cati") : VM_EXTERNAL_WEB_URL;
    CATI_DASHBOARD_URL = "https://" + catiUrl + "/Blaise/CaseInfo";
  }

  if (BLAISE_API_URL === undefined) {
    console.error("BLAISE_API_URL environment variable has not been set");
    BLAISE_API_URL = "ENV_VAR_NOT_SET";
  }

  if (VM_EXTERNAL_WEB_URL === undefined) {
    console.error("VM_EXTERNAL_WEB_URL environment variable has not been set");
    VM_EXTERNAL_WEB_URL = "ENV_VAR_NOT_SET";
  }

  if (VM_EXTERNAL_CLIENT_URL === undefined) {
    console.error("VM_EXTERNAL_CLIENT_URL environment variable has not been set");
    VM_EXTERNAL_CLIENT_URL = "ENV_VAR_NOT_SET";
  }

  if (BIMS_CLIENT_ID === undefined) {
    console.error("BIMS_CLIENT_ID environment variable has not been set");
    BIMS_CLIENT_ID = "ENV_VAR_NOT_SET";
  }

  if (BIMS_API_URL === undefined) {
    console.error("BIMS_API_URL environment variable has not been set");
    BIMS_API_URL = "ENV_VAR_NOT_SET";
  }

  const resolvedEnv: EnvironmentVariables = {
    VM_EXTERNAL_CLIENT_URL,
    VM_EXTERNAL_WEB_URL,
    BLAISE_API_URL: fixURL(BLAISE_API_URL),
    CATI_DASHBOARD_URL,
    BIMS_CLIENT_ID,
    BIMS_API_URL,
  };

  console.log(`Config.ts CATI_DASHBOARD_URL = ${CATI_DASHBOARD_URL}`);

  assertResolvedRequiredEnv(resolvedEnv);

  return resolvedEnv;
}

function fixURL(url: string): string {
  if (url.startsWith("ENV_VAR_NOT_SET") || url.startsWith("http")) {
    return url;
  }

  return `http://${url}`;
}

function assertResolvedRequiredEnv(env: EnvironmentVariables): asserts env is EnvironmentVariables {
  const missing = Object.entries(env)
    .filter(([name, value]) => !value || value.trim() === "" || value === `_${name}`)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
