const request = require("supertest");
const app = require("../src/app");
const createUserAndLogin = require("./helpers/auth");
const createService = require("./helpers/service");

describe("Service API", () => {
  test("POST /api/services should create service", async () => {
    const token = await createUserAndLogin();

    const response = await createService(token);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("User Service");
    expect(response.body.slug).toBe("user-service");
    expect(response.body.instances.length).toBe(1);
  });

  test("POST /api/services without name", async () => {
    const token = await createUserAndLogin();

    const response = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token}`)
      .send({
        baseurl: "https://jsonplaceholder.typicode.com",
      });

    expect(response.status).toBe(400);
  });

  test("POST /api/services without baseurl", async () => {
    const token = await createUserAndLogin();

    const response = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test",
      });

    expect(response.status).toBe(400);
  });

  test("GET /api/services/me", async () => {
    const token = await createUserAndLogin();

    await createService(token);

    const response = await request(app)
      .get("/api/services/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test("GET /api/services/:id", async () => {
    const token = await createUserAndLogin();

    const created = await createService(token);

    const response = await request(app)
      .get(`/api/services/${created.body._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(created.body._id);
  });

  test("GET invalid service id", async () => {
    const token = await createUserAndLogin();

    const response = await request(app)
      .get("/api/services/123")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  test("DELETE own service", async () => {
    const token = await createUserAndLogin();

    const created = await createService(token);

    const response = await request(app)
      .delete(`/api/services/${created.body._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  test("GET service that does not exist", async () => {
    const token = await createUserAndLogin();

    const response = await request(app)
      .get("/api/services/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
  test("DELETE /api/services/:id should not allow deleting another user's service", async () => {
    const token1 = await createUserAndLogin("Vipul", "vipul@test.com");

    const token2 = await createUserAndLogin("Rahul", "rahul@test.com");

    const created = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        name: "User Service",
        baseurl: "https://jsonplaceholder.typicode.com",
      });

    const response = await request(app)
      .delete(`/api/services/${created.body._id}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You do not own this service.");
  });
  test("POST /api/services/:id/rotate-secret", async () => {
    const token = await createUserAndLogin();

    const created = await createService(token);

    const response = await request(app)
      .post(`/api/services/${created.body._id}/rotate-secret`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.gatewaySecret).toBeDefined();
  });
  test("GET /api/services/:id/secret", async () => {
    const token = await createUserAndLogin();

    const created = await createService(token);

    const response = await request(app)
      .get(`/api/services/${created.body._id}/secret`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.gatewaySecret).toBeDefined();
  });
  test("POST /api/services/:id/instances", async () => {
    const token = await createUserAndLogin();

    const created = await createService(token);

    const response = await request(app)
      .post(`/api/services/${created.body._id}/instances`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        url: "https://example.com",
      });

    expect(response.status).toBe(201);
    expect(response.body.instances.length).toBe(2);
  });
  test("POST duplicate instance", async () => {
    const token = await createUserAndLogin();

    const created = await createService(token);

    await request(app)
      .post(`/api/services/${created.body._id}/instances`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        url: "https://example.com",
      });

    const response = await request(app)
      .post(`/api/services/${created.body._id}/instances`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        url: "https://example.com",
      });

    expect(response.status).toBe(409);
  });
  test("GET instances", async () => {
    const token = await createUserAndLogin();

    const created = await createService(token);

    await request(app)
      .post(`/api/services/${created.body._id}/instances`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        url: "https://example.com",
      });

    const response = await request(app)
      .get(`/api/services/${created.body._id}/instances`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
  test("DELETE instance", async () => {
    const token = await createUserAndLogin();

    const created = await createService(token);

    const added = await request(app)
      .post(`/api/services/${created.body._id}/instances`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        url: "https://example.com",
      });

    const instanceId = added.body.instances[1]._id;

    const response = await request(app)
      .delete(`/api/services/${created.body._id}/instances/${instanceId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    const instances = await request(app)
      .get(`/api/services/${created.body._id}/instances`)
      .set("Authorization", `Bearer ${token}`);

    expect(instances.body.length).toBe(1);
  });
});
