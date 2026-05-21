process.env = Object.assign(process.env, {
    NODE_ENV: "development",
    REACT_APP_CATI_DASHBOARD_URL: "cati-dashboard-url/Blaise/CaseInfo",
    REACT_APP_VM_EXTERNAL_CLIENT_URL: "external-client-url",
    VM_EXTERNAL_CLIENT_URL: "external-client-url",
    VM_EXTERNAL_WEB_URL: "external-web-url",
    BLAISE_API_URL: "mock",
    CATI_DASHBOARD_URL: "https://external-web-url/Blaise/CaseInfo",
    BIMS_CLIENT_ID: "mock@id",
    BIMS_API_URL: "mock-bims-api"
});

module.exports = {
    "testEnvironment": "jsdom",
    "coveragePathIgnorePatterns": [
        "/node_modules/"
    ],
    "setupFilesAfterEnv": [
        "<rootDir>/jest.setup.js"
    ],
    "preset": "ts-jest",
    "globals": {
        "ts-jest": {
            "tsconfig": {
                "jsx": "react-jsx",
                "esModuleInterop": true,
                "allowSyntheticDefaultImports": true
            }
        }
    },
    "moduleNameMapper": {
        "\\.(css|less|scss)$": "identity-obj-proxy"
    },
    "testPathIgnorePatterns": [
        "/node_modules/",
        "/dist/"
    ],
    "transformIgnorePatterns": ["<rootDir>/node_modules/(?!crypto-random-string|react-router-dom)"],
    "modulePathIgnorePatterns": ["<rootDir>/dist/"]
};