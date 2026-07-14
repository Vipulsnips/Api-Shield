const request = require("supertest");
const app = require("../../src/app");
async function createService(token) {
  return await request(app)
    .post("/api/services")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "User Service",
      baseurl: "https://jsonplaceholder.typicode.com",
    });
}

module.exports = createService