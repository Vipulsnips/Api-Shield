const request = require("supertest");
const axios = require("axios");

jest.mock("axios");

jest.mock("../src/config/redis", () => ({
  get: jest.fn(),
  set: jest.fn(),
  incr: jest.fn(),
}));

const redisClient = require("../src/config/redis");

const app = require("../src/app");

const setupGateway = require("./helpers/setupGateway");
const RequestLog = require("../src/models/requestLog");
const Service = require("../src/models/service");
test("should forward request to the instance selected by redis", async () => {
  const { service, apiKey } = await setupGateway();

  await Service.findByIdAndUpdate(service.body._id, {
    $push: {
      instances: {
        url: "https://backup-service.com",
        healthStatus: "healthy",
      },
    },
  });

  const updatedService = await Service.findById(service.body._id);

  redisClient.get.mockResolvedValue("1");
  redisClient.set.mockResolvedValue("OK");

  axios.mockResolvedValue({
    status: 200,
    data: {
      message: "OK",
    },
  });

  const response = await request(app)
    .get(`/api/gateway/${service.body.slug}`)
    .set("x-api-key", apiKey.key);

  expect(response.status).toBe(200);
  expect(response.body.message).toBe("OK");

  expect(axios).toHaveBeenCalledTimes(1);

  expect(axios.mock.calls[0][0].url).toContain(updatedService.instances[1].url);

  expect(redisClient.set).toHaveBeenCalledWith(`rr:${service.body._id}`, 0);

  test("should reject api key belonging to another service", async () => {
    // Create user, service A and API key for service A
    const { token, service: serviceA, apiKey } = await setupGateway();

    // Create service B
    const serviceB = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Payment Service",
        baseurl: "https://payment.example.com",
      });

    const response = await request(app)
      .get(`/api/gateway/${serviceB.body.slug}`)
      .set("x-api-key", apiKey.key);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You do not own this service.");
  });
});
