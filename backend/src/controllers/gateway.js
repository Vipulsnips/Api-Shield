const RequestLog = require("../models/requestLog");
const Service = require("../models/service");
const axios = require("axios");
const redisClient = require("../config/redis");
async function forwardRequest(forwardUrl, req, forwardHeaders, service) {
  return axios({
    url: forwardUrl,
    method: req.method,
    data: req.body,
    params: req.query,
    headers: {
      ...forwardHeaders,
      "x-gateway-secret": service.gatewaySecret,
    },
    timeout: 5000,
    validateStatus: () => true,
  });
}
async function handleRequest(req, res) {
  const apiKey = req.apiKey;
  const slug = req.params.slug;
  const service = await Service.findOne({ slug });
  if (!service)
    return res.status(404).json({
      message: "Service not found",
    });
  if (service._id.toString() !== apiKey.service.toString()) {
    return res.status(403).json({
      message: "API Key does not belong to this service",
    });
  }
  const healthyInstances = service.instances.filter(
    (instance) => instance.healthStatus === "healthy",
  );
  if (healthyInstances.length === 0) {
    return res.status(503).json({
      message: "No healthy instances available",
    });
  }
  const redisKey = `rr:${service._id}`;
  let index = Number((await redisClient.get(redisKey)) ?? 0);
  index %= healthyInstances.length;
  const selectedInstance = healthyInstances[index];
  await redisClient.set(redisKey, (index + 1) % healthyInstances.length);
  const remainingPath = req.params.rest ? "/" + req.params.rest.join("/") : "";
  const forwardUrl = selectedInstance.url.toString() + remainingPath;
  const start = Date.now();
  const forwardHeaders = { ...req.headers };
  delete forwardHeaders.host;
  delete forwardHeaders.authorization;
  delete forwardHeaders["x-api-key"];
  delete forwardHeaders["content-length"];
  try {
    const response = await forwardRequest(
      forwardUrl,
      req,
      forwardHeaders,
      service,
    );
    const responseTime = Date.now() - start;
    await RequestLog.create({
      service: service._id,
      apiKey: apiKey._id,
      responseTime,
      statusCode: response.status,
      method: req.method,
      path: remainingPath,
    });
    return res.status(response.status).send(response.data);
  } catch (error) {
    if (!error.response) {
      selectedInstance.healthStatus = "unhealthy";
      selectedInstance.lastChecked = new Date();
      await service.save();
      let retryInstance;
      try {
        const retryInstances = healthyInstances.filter(
          (instance) =>
            instance._id.toString() !== selectedInstance._id.toString(),
        );
        if (retryInstances.length === 0) {
          return res.status(503).json({
            message: "No healthy instances available",
          });
        }
        retryInstance = retryInstances[0];
        const retryForwardUrl = retryInstance.url.toString() + remainingPath;
        const response = await forwardRequest(
          retryForwardUrl,
          req,
          forwardHeaders,
          service,
        );
        const responseTime = Date.now() - start;
        await RequestLog.create({
          service: service._id,
          apiKey: apiKey._id,
          responseTime,
          statusCode: response.status,
          method: req.method,
          path: remainingPath,
        });
        return res.status(response.status).send(response.data);
      } catch (retryError) {
        if (retryInstance) {
          retryInstance.healthStatus = "unhealthy";
          retryInstance.lastChecked = new Date();
          await service.save();
        }
        const responseTime = Date.now() - start;
        await RequestLog.create({
          service: service._id,
          apiKey: apiKey._id,
          responseTime,
          statusCode: retryError.response?.status || 500,
          method: req.method,
          path: remainingPath,
        });
        if (retryError.response) {
          return res
            .status(retryError.response.status)
            .send(retryError.response.data);
        }
        return res.status(503).json({
          message: "No healthy instances available"
        });
      }
    }
    return res.status(error.response.status).send(error.response.data);
  }
}
module.exports = handleRequest;
