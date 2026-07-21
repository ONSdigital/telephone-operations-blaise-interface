import { createRoot } from "react-dom/client";

import * as serviceWorker from "./serviceWorker";

const renderMock = vi.fn();
const createRootMock = vi.mocked(createRoot);
const unregisterMock = vi.mocked(serviceWorker.unregister);

vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({ render: renderMock })),
}));

vi.mock("./serviceWorker", () => ({
  unregister: vi.fn(),
}));

vi.mock("./App", () => ({
  default: () => null,
}));

describe("client index bootstrap", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("creates root and unregisters service worker when root element exists", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await import("./index");

    expect(createRootMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(unregisterMock).toHaveBeenCalledTimes(1);
  });

  it("throws an error when root element does not exist", async () => {
    document.body.innerHTML = "";

    await expect(import("./index")).rejects.toThrow("Root container element not found");
  });
});
