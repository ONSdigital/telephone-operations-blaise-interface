// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Keep client snapshots deterministic across local and CI environments.
const testWindow = window as Window & {
  VM_EXTERNAL_CLIENT_URL?: string;
  CATI_DASHBOARD_URL?: string;
};

testWindow.VM_EXTERNAL_CLIENT_URL = "dev-tobi.social-surveys.gcp.onsdigital.uk";
testWindow.CATI_DASHBOARD_URL = "https://dev-cati.social-surveys.gcp.onsdigital.uk/Blaise/CaseInfo";

const appConfigElement = document.createElement("script");

appConfigElement.id = "app-config";
appConfigElement.type = "application/json";
appConfigElement.textContent = JSON.stringify({
  vmExternalClientUrl: "dev-tobi.social-surveys.gcp.onsdigital.uk",
  catiDashboardUrl: "https://dev-cati.social-surveys.gcp.onsdigital.uk/Blaise/CaseInfo",
});
document.body.appendChild(appConfigElement);
