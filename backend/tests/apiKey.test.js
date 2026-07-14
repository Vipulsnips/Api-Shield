const request = require("supertest");
const app = require("../src/app");
const createUserAndLogin = require("./helpers/auth");
const createService = require("./helpers/service");

describe("API Key API", () => {
  test("POST /api/apiKeys/:serviceId should create API key", async () => {
    const token = await createUserAndLogin();

    const service = await createService(token);

    const response = await request(app)
      .post(`/api/apiKeys/${service.body._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body.key).toBeDefined();
    expect(response.body.active).toBe(true);
  });

  test("GET /api/apiKeys should return my API keys", async () => {
    const token = await createUserAndLogin();

    const service = await createService(token);

    await request(app)
      .post(`/api/apiKeys/${service.body._id}`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .get("/api/apiKeys")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].key).toBeDefined();
  });

  test("DELETE /api/apiKeys/:id should delete API key", async () => {
    const token = await createUserAndLogin();

    const service = await createService(token);

    const apiKey = await request(app)
      .post(`/api/apiKeys/${service.body._id}`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .delete(`/api/apiKeys/${apiKey.body._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("API key deleted successfully");
  });

  test("POST /api/apiKeys/:serviceId with invalid service", async () => {
    const token = await createUserAndLogin();

    const response = await request(app)
      .post("/api/apiKeys/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Service not found");
  });

  test("DELETE should not delete another user's API key", async () => {
    const token1 = await createUserAndLogin("Vipul", "vipul@test.com");

    const token2 = await createUserAndLogin("Rahul", "rahul@test.com");

    const service = await createService(token1);

    const apiKey = await request(app)
      .post(`/api/apiKeys/${service.body._id}`)
      .set("Authorization", `Bearer ${token1}`);

    const response = await request(app)
      .delete(`/api/apiKeys/${apiKey.body._id}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You do not own this service.");
  });

  test("POST should not create API key for another user's service", async () => {
    const token1 = await createUserAndLogin("Vipul", "vipul@test.com");

    const token2 = await createUserAndLogin("Rahul", "rahul@test.com");

    const service = await createService(token1);

    const response = await request(app)
      .post(`/api/apiKeys/${service.body._id}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You do not own this service.");
  });

  test("DELETE invalid API key id", async () => {
    const token = await createUserAndLogin();

    const response = await request(app)
      .delete("/api/apiKeys/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("No such Key exists");
  });
});
