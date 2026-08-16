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
const Service = require("../src/models/service");

describe("Gateway API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    redisClient.incr.mockResolvedValue(2);

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

    expect(axios.mock.calls[0][0].url).toContain(
      updatedService.instances[1].url,
    );

    expect(redisClient.incr).toHaveBeenCalledWith(`rr:${service.body._id}`);
  });

  test("should reject api key belonging to another service", async () => {
    const { token, apiKey } = await setupGateway();

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

  test("should distribute concurrent requests using atomic redis increment", async () => {
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

    redisClient.incr
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4);

    axios.mockResolvedValue({
      status: 200,
      data: {
        message: "OK",
      },
    });

    const responses = await Promise.all(
      Array.from({ length: 4 }, () =>
        request(app)
          .get(`/api/gateway/${service.body.slug}`)
          .set("x-api-key", apiKey.key),
      ),
    );

    responses.forEach((response) => {
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("OK");
    });

    expect(redisClient.incr).toHaveBeenCalledTimes(4);


    expect(axios).toHaveBeenCalledTimes(4);

    const forwardedUrls = axios.mock.calls.map((call) => call[0].url);

    const instanceA = updatedService.instances[0].url.toString();
    const instanceB = updatedService.instances[1].url.toString();

    expect(forwardedUrls.filter((url) => url.includes(instanceA))).toHaveLength(
      2,
    );

    expect(forwardedUrls.filter((url) => url.includes(instanceB))).toHaveLength(
      2,
    );
  });
});
