const ApiKey = require("../models/apiKey");
const Service = require("../models/service");
async function createApiKey(req, res, next) {
  const user = req.user;
  const serviceId = req.params.serviceId;
  const service = await Service.findById(serviceId);
  if (!service) {
    const error = new Error("Service not found");
    error.statusCode = 404;
    return next(error);
  }
  if (user._id.toString() !== service.owner.toString()) {
    const error = new Error("You do not own this service.");
    error.statusCode = 403;
    return next(error);
  }
  const apiKey = await ApiKey.create({
    service: service._id,
    owner: user._id,
  });
  return res.status(201).json(apiKey);
}
async function getMyApiKeys(req, res) {
  const myApiKeys = await ApiKey.find({ owner: req.user._id });
  return res.json(myApiKeys);
}
async function deleteApiKey(req, res, next) {
  const user = req.user;
  const id = req.params.id;
  const apiKey = await ApiKey.findById(id);
  if (!apiKey) {
    const error = new Error("No such Key exists");
    error.statusCode = 404;
    return next(error);
  }
  if (user._id.toString() !== apiKey.owner.toString()) {
    const error = new Error("You do not own this API key.");
    error.statusCode = 403;
    return next(error);
  }
  await ApiKey.findByIdAndDelete(id);
  return res.status(200).json({ message: "API key deleted successfully"});
}

module.exports = {
  createApiKey,
  getMyApiKeys,
  deleteApiKey,
};
