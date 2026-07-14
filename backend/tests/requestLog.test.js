const request = require("supertest");
const app = require("../src/app");

const RequestLog = require("../src/models/requestLog");

const createUserAndLogin = require("./helpers/auth");
const  createService  = require("./helpers/service");

describe("Analytics API", () => {
  test("GET request logs should return all logs", async () => {
    const token = await createUserAndLogin();

    const service = await createService(token);

    await RequestLog.create({
      service: service.body._id,
      apiKey: service.body._id,
      instanceUrl: "https://jsonplaceholder.typicode.com",
      statusCode: 200,
      method: "GET",
      path: "/posts",
      responseTime: 120,
    });

    await RequestLog.create({
      service: service.body._id,
      apiKey: service.body._id,
      instanceUrl: "https://jsonplaceholder.typicode.com",
      statusCode: 404,
      method: "GET",
      path: "/posts/100",
      responseTime: 80,
    });

    const response = await request(app)
      .get(`/api/analytics/service/${service.body._id}/logs`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("GET analytics summary should return correct statistics", async () => {
    const token = await createUserAndLogin();

    const service = await createService(token);

    await RequestLog.create([
      {
        service: service.body._id,
        apiKey: service.body._id,
        instanceUrl: "instance-1",
        statusCode: 200,
        method: "GET",
        path: "/",
        responseTime: 100,
      },
      {
        service: service.body._id,
        apiKey: service.body._id,
        instanceUrl: "instance-1",
        statusCode: 500,
        method: "GET",
        path: "/",
        responseTime: 200,
      },
      {
        service: service.body._id,
        apiKey: service.body._id,
        instanceUrl: "instance-2",
        statusCode: 201,
        method: "POST",
        path: "/",
        responseTime: 300,
      },
    ]);

    const response = await request(app)
      .get(`/api/analytics/service/${service.body._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.totalRequests).toBe(3);
    expect(response.body.successRequests).toBe(2);
    expect(response.body.failedRequests).toBe(1);
    expect(response.body.avgResponseTime).toBe(200);

    expect(response.body.instances.length).toBe(2);
  });

  test("GET analytics for service with no logs", async () => {
    const token = await createUserAndLogin();

    const service = await createService(token);

    const response = await request(app)
      .get(`/api/analytics/service/${service.body._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.totalRequests).toBe(0);
    expect(response.body.successRequests).toBe(0);
    expect(response.body.failedRequests).toBe(0);
    expect(response.body.avgResponseTime).toBe(0);
    expect(response.body.instances).toEqual([]);
  });

  test("GET analytics with invalid service id", async () => {
    const token = await createUserAndLogin();

    const response = await request(app)
      .get("/api/analytics/service/123")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid ID format");
  });

  test("GET analytics of another user's service", async () => {
    const token1 = await createUserAndLogin(
      "Vipul",
      "vipul@test.com"
    );

    const token2 = await createUserAndLogin(
      "Rahul",
      "rahul@test.com"
    );

    const service = await createService(token1);

    const response = await request(app)
      .get(`/api/analytics/service/${service.body._id}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Forbidden");
  });

  test("GET logs of another user's service", async () => {
    const token1 = await createUserAndLogin(
      "Vipul",
      "vipul@test.com"
    );

    const token2 = await createUserAndLogin(
      "Rahul",
      "rahul@test.com"
    );

    const service = await createService(token1);

    const response = await request(app)
      .get(`/api/analytics/service/${service.body._id}/logs`)
      .set("Authorization", `Bearer ${token2}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Forbidden");
  });

  test("GET analytics for non-existing service", async () => {
    const token = await createUserAndLogin();

    const response = await request(app)
      .get("/api/analytics/service/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Service not found");
  });
});