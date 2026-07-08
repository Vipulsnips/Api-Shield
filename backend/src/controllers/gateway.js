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
async function handleRequest(req, res, next) {
  const apiKey = req.apiKey;
  const slug = req.params.slug;
  const service = await Service.findOne({ slug });
  if (!service) {
    const error = new Error("Service does not exist.");
    error.statusCode = 404;
    return next(error);
  }
  if (service._id.toString() !== apiKey.service.toString()) {
    const error = new Error("You do not own this service.");
    error.statusCode = 403;
    return next(error);
  }
  const healthyInstances = service.instances.filter(
    (instance) => instance.healthStatus === "healthy",
  );
  if (healthyInstances.length === 0) {
    const error = new Error("No healthy instances available");
    error.statusCode = 503;
    return next(error);
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
      instanceUrl: selectedInstance.url,
    });
    return res.status(response.status).send(response.data);
  } catch (error) {
    if (!error.response) {
      selectedInstance.healthStatus = "unhealthy";
      selectedInstance.lastChecked = new Date();
      await service.save();
      let retryInstance, retryForwardUrl, retryInstances;
      try {
        retryInstances = healthyInstances.filter(
          (instance) =>
            instance._id.toString() !== selectedInstance._id.toString(),
        );
        if (retryInstances.length === 0) {
          const error = new Error("No healthy instances available");
          error.statusCode = 503;
          return next(error);
        }
        retryInstance = retryInstances[0];
        retryForwardUrl = retryInstance.url.toString() + remainingPath;
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
          instanceUrl: retryInstance.url,
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
          instanceUrl: retryInstance?.url,
        });
        if (retryError.response) {
          return res
            .status(retryError.response.status)
            .send(retryError.response.data);
        }
        const error = new Error("No healthy instances available");
        error.statusCode = 503;
        return next(error);
      }
    }
    return res.status(error.response.status).send(error.response.data);
  }
}
module.exports = handleRequest;
