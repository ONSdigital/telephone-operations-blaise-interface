import AuthProvider from "./index";
import jwt from "jsonwebtoken";

jest.mock("./GoogleTokenProvider");
import getGoogleAuthToken from "./GoogleTokenProvider";
import { Logger } from "../Logger";

const mockedGetGoogleAuthToken = getGoogleAuthToken as jest.Mock<Promise<string>>;

function mock_AuthToken(token: string) {
    mockedGetGoogleAuthToken.mockImplementationOnce(() => {
        return Promise.resolve(token);
    });
}

afterEach(() => {
    mockedGetGoogleAuthToken.mockClear();
    jest.clearAllMocks();
    jest.resetAllMocks();
});

const log: Logger = {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
};

it("We can get back Auth headers with a token", async () => {
    const uniqueToken = "A Token";
    mock_AuthToken(uniqueToken);
    const googleAuthProvider = new AuthProvider("BIMS_CLIENT_ID", log);

    const authHeader = await googleAuthProvider.getAuthHeader();

    expect(authHeader).toEqual({Authorization: `Bearer ${uniqueToken}`});
    expect(mockedGetGoogleAuthToken).toBeCalledWith("BIMS_CLIENT_ID");
});


it("We get a new token when a token has expired", async () => {
    // Setup old token for 30 seconds in the past
    const older_token = jwt.sign({foo: "bar", exp: Math.floor(Date.now() / 1000) - 30}, "shhhhh");
    mock_AuthToken(older_token);
    const googleAuthProvider = new AuthProvider("BIMS_CLIENT_ID", log);
    await googleAuthProvider.getAuthHeader();

    // Call for header with should have expired now
    const updatedToken = "SecondaryTokenCalled";
    mock_AuthToken(updatedToken);

    const authHeader = await googleAuthProvider.getAuthHeader();

    expect(authHeader).toEqual({Authorization: `Bearer ${updatedToken}`});
    expect(log.info).toHaveBeenCalledWith("Auth Token Expired, Calling for new Google auth Token");
});


it("We receive the same token if it hasn't expired", async () => {
    // Setup token for an hour in the future
    const older_token = jwt.sign({foo: "bar", exp: Math.floor(Date.now() / 1000) + (60 * 60)}, "shhhhh");
    mock_AuthToken(older_token);
    const googleAuthProvider = new AuthProvider("BIMS_CLIENT_ID", log);
    await googleAuthProvider.getAuthHeader();

    // Call for header with should not have expired
    const updatedToken = "SecondaryTokenCalled";
    mock_AuthToken(updatedToken);

    const authHeader = await googleAuthProvider.getAuthHeader();

    // Token should not have been updated
    expect(authHeader).toEqual({Authorization: `Bearer ${older_token}`});
    expect(mockedGetGoogleAuthToken).toHaveBeenCalledTimes(1);
});


it("We get a new token when a token is invalid", async () => {
    // Setup old token which is broken
    mock_AuthToken("%%%%%");
    const googleAuthProvider = new AuthProvider("BIMS_CLIENT_ID", log);
    await googleAuthProvider.getAuthHeader();

    // Call for header again which should update
    const updatedToken = "SecondaryTokenCalled";
    mock_AuthToken(updatedToken);

    const authHeader = await googleAuthProvider.getAuthHeader();

    expect(authHeader).toEqual({Authorization: `Bearer ${updatedToken}`});
    expect(log.info).toHaveBeenCalledWith("Failed to decode token, Calling for new Google auth Token");
});
