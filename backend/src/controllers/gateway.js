const ApiKey = require("../models/apiKey");
const Service = require("../models/service");
const axios = require("axios");
async function handleRequest(req, res) {
  const key = req.headers["x-api-key"];
  if (!key)
    return res.status(401).json({
      message: "API Key required",
    });
  const apiKey = await ApiKey.findOne({ key, active: true });
  if (!apiKey)
    return res.status(401).json({
      message: "API Key required",
    });
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
  const remainingPath = "/" + req.params.rest.join("/");
  const forwardUrl = service.baseurl.toString() + remainingPath;
  try {
    const response = await axios({
      url: forwardUrl,
      method: req.method,
      data: req.body,
      params: req.query
    });
    return res.status(response.status).send(response.data);
  } catch (error) {
    return res.status(500).json({
      message: "Gateway Error",
    });
  }
}
module.exports = handleRequest;
