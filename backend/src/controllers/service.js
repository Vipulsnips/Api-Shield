const Service = require("../models/service");
const axios = require("axios");
const crypto = require("crypto");
const validateServiceUrl = require("../../utils/validateServiceUrl");
async function createService(req, res, next) {
  const { name, baseurl } = req.body;
  if (!name || !baseurl) {
    const error = new Error("Name and baseurl required");
    error.statusCode = 400;
    return next(error);
  }
  const validation = validateServiceUrl(baseurl);
  if (!validation.valid) {
    const error = new Error(validation.message);
    error.statusCode = 400;
    return next(error);
  }
  const user = req.user;
  const service = await Service.create({
    name,
    baseurl,
    owner: user._id,
    instances: [
      {
        url: baseurl,
      },
    ],
  });
  return res.status(201).json({
    ...service.toObject(),
    message:
      "Save your gatewaySecret now — it will not be shown again in full. Configure your service to verify the x-gateway-secret header on incoming requests.",
  });
}
async function getAllServices(req, res) {
  const allServices = await Service.find({}).select("-gatewaySecret");
  return res.json(allServices);
}
async function getServiceById(req, res, next) {
  const id = req.params.id;
  if (!id) {
    const error = new Error("Id required");
    error.statusCode = 400;
    return next(error);
  }
  const service = await Service.findById(id).select("-gatewaySecret");
  if (!service) {
    const error = new Error("Service does not exist.");
    error.statusCode = 404;
    return next(error);
  }
  return res.status(200).json(service);
}
async function deleteService(req, res, next) {
  const id = req.params.id;
  const user = req.user;
  if (!id) {
    const error = new Error("Id required");
    error.statusCode = 400;
    return next(error);
  }
  const service = await Service.findById(id);
  if (!service) {
    const error = new Error("Service not found.");
    error.statusCode = 404;
    return next(error);
  }
  if (user._id.toString() !== service.owner.toString()) {
    const error = new Error("You do not own this service.");
    error.statusCode = 403;
    return next(error);
  }
  await Service.findByIdAndDelete(id);
  return res.json({ message: "Success." });
}
async function getMyServices(req, res) {
  const owner = req.user._id;
  const services = await Service.find({ owner }).select("-gatewaySecret");
  return res.json(services);
}
async function checkHealthById(req, res, next) {
  const id = req.params.id;
  const service = await Service.findById(id);
  if (!service) {
    const error = new Error("Service not found");
    error.statusCode = 404;
    return next(error);
  }
  const user = req.user;
  if (service.owner.toString() !== user._id.toString()) {
    const error = new Error("You do not own this service");
    error.statusCode = 403;
    return next(error);
  }
  const results = [],
    checkedAt = new Date();
  for (const instance of service.instances) {
    try {
      await axios.get(instance.url, {
        timeout: 3000,
        validateStatus: () => true,
      });
      instance.healthStatus = "healthy";
    } catch (err) {
      instance.healthStatus = "unhealthy";
    }
    instance.lastChecked = checkedAt;
    results.push({
      url: instance.url,
      healthStatus: instance.healthStatus,
      lastChecked: instance.lastChecked,
    });
  }
  await service.save();
  return res.status(200).json({
    message: "Health check completed",
    instances: results,
  });
}
async function rotateGatewaySecret(req, res, next) {
  const id = req.params.id;
  const user = req.user;
  const service = await Service.findById(id);
  if (!service) {
    const error = new Error("Service not found");
    error.statusCode = 404;
    return next(error);
  }
  if (service.owner.toString() !== user._id.toString()) {
    const error = new Error("You do not own this service");
    error.statusCode = 403;
    return next(error);
  }
  service.gatewaySecret = crypto.randomBytes(32).toString("hex");
  await service.save();
  return res.status(200).json({
    gatewaySecret: service.gatewaySecret,
    message:
      "Gateway secret rotated. Update your service's configuration immediately — the old secret no longer works.",
  });
}
async function getGatewaySecret(req, res, next) {
  const serviceId = req.params.id;
  const service = await Service.findById(serviceId);
  if (!service) {
    const error = new Error("Service not found");
    error.statusCode = 404;
    return next(error);
  }
  if (service.owner.toString() !== req.user._id.toString()) {
    const error = new Error("You do not own this service");
    error.statusCode = 403;
    return next(error);
  }
  return res.status(200).json({
    gatewaySecret: service.gatewaySecret,
  });
}
async function addInstance(req, res, next) {
  const serviceId = req.params.id;
  const { url } = req.body;

  if (!url) {
    const error = new Error("Instance URL is required");
    error.statusCode = 400;
    return next(error);
  }

  const validation = validateServiceUrl(url);

  if (!validation.valid) {
    const error = new Error(validation.message);
    error.statusCode = 400;
    return next(error);
  }

  const service = await Service.findById(serviceId);

  if (!service) {
    const error = new Error("Service not found");
    error.statusCode = 404;
    return next(error);
  }

  if (service.owner.toString() !== req.user._id.toString()) {
    const error = new Error("You do not own this service");
    error.statusCode = 403;
    return next(error);
  }
  const alreadyExists = service.instances.some((instance) => {
    return instance.url === url;
  });
  if (alreadyExists) {
    const error = new Error("Instance already exists");
    error.statusCode = 409;
    return next(error);
  }
  service.instances.push({
    url,
  });

  await service.save();

  return res.status(201).json({
    message: "Instance added successfully",
    instances: service.instances,
  });
}
async function getInstances(req, res, next) {
  const id = req.params.id;
  const service = await Service.findById(id);
  if (!service) {
    const error = new Error("Service not found");
    error.statusCode = 404;
    return next(error);
  }
  if (service.owner.toString() !== req.user._id.toString()) {
    const error = new Error("You do not own this service");
    error.statusCode = 403;
    return next(error);
  }
  return res.status(200).json(service.instances);
}
async function deleteInstance(req, res, next) {
  const { id, instanceId } = req.params;
  const service = await Service.findById(id);
  if (!service) {
    const error = new Error("Service not found");
    error.statusCode = 404;
    return next(error);
  }
  if (service.owner.toString() !== req.user._id.toString()) {
    const error = new Error("You do not own this service");
    error.statusCode = 403;
    return next(error);
  }
  const instance = service.instances.id(instanceId);
  if (!instance) {
    const error = new Error("Instance not found");
    error.statusCode = 404;
    return next(error);
  }
  instance.deleteOne();
  await service.save();
  return res.json({
    message: "Instance deleted successfully",
  });
}
module.exports = {
  createService,
  getAllServices,
  getServiceById,
  deleteService,
  getMyServices,
  checkHealthById,
  rotateGatewaySecret,
  getGatewaySecret,
  addInstance,
  getInstances,
  deleteInstance,
};
