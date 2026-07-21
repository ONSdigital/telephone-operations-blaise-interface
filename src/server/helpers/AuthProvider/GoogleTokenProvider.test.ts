import getGoogleAuthToken from "./GoogleTokenProvider";

const { getIdTokenClientMock, GoogleAuthMock } = vi.hoisted(() => {
  const hoistedGetIdTokenClientMock = vi.fn();

  class HoistedGoogleAuthMock {
    getIdTokenClient = hoistedGetIdTokenClientMock;
  }

  return {
    getIdTokenClientMock: hoistedGetIdTokenClientMock,
    GoogleAuthMock: HoistedGoogleAuthMock,
  };
});

vi.mock("google-auth-library", () => ({
  GoogleAuth: GoogleAuthMock,
}));

describe("getGoogleAuthToken", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("returns token from idTokenProvider", async () => {
    const fetchIdTokenMock = vi.fn().mockResolvedValue("test-token");

    getIdTokenClientMock.mockResolvedValue({
      idTokenProvider: {
        fetchIdToken: fetchIdTokenMock,
      },
    });

    const token = await getGoogleAuthToken("test-audience");

    expect(token).toBe("test-token");
    expect(getIdTokenClientMock).toHaveBeenCalledWith("test-audience");
    expect(fetchIdTokenMock).toHaveBeenCalledWith("test-audience");
  });

  it("returns empty string when auth client fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    getIdTokenClientMock.mockRejectedValue(new Error("credential failure"));

    const token = await getGoogleAuthToken("test-audience");

    expect(token).toBe("");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Could not get the Google auth token credentials");
  });
});
