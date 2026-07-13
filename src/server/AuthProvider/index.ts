import jwt from "jsonwebtoken";
import getGoogleAuthToken from "./GoogleTokenProvider";
import { Logger } from "../Logger";

export default class AuthProvider {
    private token: string;

    constructor(private readonly BIMS_CLIENT_ID: string, private readonly log: Logger) {
        this.token = "";
    }

    async getAuthHeader(): Promise<{ Authorization: string }> {
        if (!this.isValidToken()) {
            this.token = await getGoogleAuthToken(this.BIMS_CLIENT_ID);
        }
        return {Authorization: `Bearer ${this.token}`};
    }

    private isValidToken(): boolean {
        if (this.token === "") {
            return false;
        }
        const decodedToken = jwt.decode(this.token, {json: true});
        if (decodedToken === null) {
            this.log.info("Failed to decode token, Calling for new Google auth Token");
            return false;
        } else if (AuthProvider.hasTokenExpired(decodedToken["exp"] || 0)) {
            this.log.info("Auth Token Expired, Calling for new Google auth Token");

            return false;
        }

        return true;
    }

    private static hasTokenExpired(expireTimestamp: number): boolean {
        return expireTimestamp < Math.floor(new Date().getTime() / 1000);
    }
}
