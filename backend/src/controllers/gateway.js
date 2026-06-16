const ApiKey = require("../models/apiKey");
const RequestLog = require("../models/requestLog");
const Service = require("../models/service");
const axios = require("axios");
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
  const remainingPath = req.params.rest ? "/" + req.params.rest.join("/") : "";
  const forwardUrl = service.baseurl.toString() + remainingPath;
  const start = Date.now();
  const forwardHeaders = { ...req.headers };
  delete forwardHeaders.host;
  delete forwardHeaders.authorization;
  delete forwardHeaders["x-api-key"];
  delete forwardHeaders["content-length"];
  try {
    const response = await axios({
      url: forwardUrl,
      method: req.method,
      data: req.body,
      params: req.query,
      headers: {
        ...forwardHeaders,
        "x-gateway-secret":service.gatewaySecret,
      },
      validateStatus: () => true
    });
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
    const responseTime = Date.now() - start;

    await RequestLog.create({
      service: service._id,
      apiKey: apiKey._id,
      responseTime,
      statusCode: error.response?.status || 500,
      method: req.method,
      path: remainingPath,
    });
    if (error.response) {
      return res.status(error.response.status).send(error.response.data);
    }
    return res.status(500).json({
      message: "Gateway Error",
    });
  }
}
module.exports = handleRequest;
