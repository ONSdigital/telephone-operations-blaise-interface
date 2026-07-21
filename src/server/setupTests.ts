// Server test setup for Vitest.
process.env.VM_EXTERNAL_CLIENT_URL ??= "external-client-url";
process.env.VM_EXTERNAL_WEB_URL ??= "external-web-url";
process.env.BLAISE_API_URL ??= "mock";
process.env.BIMS_CLIENT_ID ??= "mock@id";
process.env.BIMS_API_URL ??= "mock-bims-api";
