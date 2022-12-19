import app from "../server"; // Link to your server file
import supertest from "supertest";
const request = supertest(app);



describe("Test Heath Endpoint", () => {
    it("should return a 200 status and json message", async () => {
        try {
            const response = await request.get("/tobi-ui/version/health");

            expect(response.statusCode).toEqual(200);
            expect(response.body).toStrictEqual({healthy: true});
        } catch (error) {
            console.error(error);
        }
    });
});