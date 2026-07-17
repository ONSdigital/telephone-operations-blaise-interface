import { unregister } from "./serviceWorker";

describe("serviceWorker.unregister", () => {
  const originalServiceWorker = (navigator as Navigator & { serviceWorker?: unknown })
    .serviceWorker;

  afterEach(() => {
    if (originalServiceWorker === undefined) {
      Reflect.deleteProperty(navigator as unknown as Record<string, unknown>, "serviceWorker");
    } else {
      Object.defineProperty(navigator, "serviceWorker", {
        value: originalServiceWorker,
        configurable: true,
      });
    }

    vi.restoreAllMocks();
  });

  it("unregisters service worker when available", async () => {
    const unregisterMock = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve({ unregister: unregisterMock }),
      },
      configurable: true,
    });

    unregister();
    await Promise.resolve();
    await Promise.resolve();

    expect(unregisterMock).toHaveBeenCalledTimes(1);
  });

  it("logs errors when service worker ready rejects", async () => {
    const error = new Error("boom");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        ready: Promise.reject(error),
      },
      configurable: true,
    });

    unregister();
    await Promise.resolve();
    await Promise.resolve();

    expect(consoleErrorSpy).toHaveBeenCalledWith("boom");
  });
});
