const request = require("supertest");
const app = require("../../src/app");

async function createApiKey(token, serviceId) {
  const response = await request(app)
    .post(`/api/apiKeys/${serviceId}`)
    .set("Authorization", `Bearer ${token}`);

  return response.body;
}

module.exports = createApiKey;
