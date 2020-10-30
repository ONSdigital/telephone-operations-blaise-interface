const app = require("../server"); // Link to your server file
const supertest = require("supertest");
const request = supertest(app);



describe("Test Heath Endpoint", () => {
    it("should return a 200 status and json message", async done => {
        const response = await request.get("/health_check");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toStrictEqual({status: 200});
        done();
    });
});