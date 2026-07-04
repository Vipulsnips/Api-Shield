const Service = require("../models/service");
const axios = require("axios");
const crypto = require("crypto");
const validateServiceUrl = require("../../utils/validateServiceUrl");
async function createService(req, res) {
  const { name, baseurl } = req.body;
  if (!name || !baseurl) {
    return res.status(400).json({
      message: "Name and baseurl required",
    });
  }
  const validation = validateServiceUrl(baseurl);
  if (!validation.valid) {
    return res.status(400).json({
      message: validation.message,
    });
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
async function getServiceById(req, res) {
  const id = req.params.id;
  if (!id)
    return res.status(400).json({
      message: "Id required",
    });
  const service = await Service.findById(id).select("-gatewaySecret");
  if (!service)
    return res.status(400).json({ message: "Service does not exist." });
  return res.status(200).json(service);
}
async function deleteService(req, res) {
  const id = req.params.id;
  const user = req.user;
  if (!id) {
    return res.status(400).json({
      message: "Id required",
    });
  }
  const service = await Service.findById(id);
  if (!service) {
    return res.status(404).json({
      message: "Service not found",
    });
  }
  if (user._id.toString() !== service.owner.toString())
    return res.status(403).json({ message: "Forbidden" });
  await Service.findByIdAndDelete(id);
  return res.json({ message: "Success." });
}
async function getMyServices(req, res) {
  const owner = req.user._id;
  const services = await Service.find({ owner }).select("-gatewaySecret");
  return res.json(services);
}
async function checkHealthById(req, res) {
  const id = req.params.id;
  const service = await Service.findById(id);
  if (!service) {
    return res.status(404).json({
      message: "Service not found",
    });
  }
  const user = req.user;
  if (service.owner.toString() !== user._id.toString()) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }
  try {
    await axios.get(service.baseurl.toString());
    service.healthStatus = "healthy";
    service.lastChecked = new Date();
    await service.save();
    return res.status(200).json({
      status: "healthy",
    });
  } catch (err) {
    service.healthStatus = "unhealthy";
    service.lastChecked = new Date();
    await service.save();
    return res.status(200).json({
      status: "unhealthy",
    });
  }
}
async function rotateGatewaySecret(req, res) {
  const id = req.params.id;
  const user = req.user;
  const service = await Service.findById(id);
  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }
  if (service.owner.toString() !== user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }
  service.gatewaySecret = crypto.randomBytes(32).toString("hex");
  await service.save();
  return res.status(200).json({
    gatewaySecret: service.gatewaySecret,
    message:
      "Gateway secret rotated. Update your service's configuration immediately — the old secret no longer works.",
  });
}
async function getGatewaySecret(req, res) {
  const serviceId = req.params.id;
  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({
      message: "Service not found",
    });
  }
  if (service.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: "Unauthorized",
    });
  }
  return res.status(200).json({
    gatewaySecret: service.gatewaySecret,
  });
}
async function addInstance(req, res) {
  const serviceId = req.params.id;
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      message: "Instance URL is required",
    });
  }

  const validation = validateServiceUrl(url);

  if (!validation.valid) {
    return res.status(400).json({
      message: validation.message,
    });
  }

  const service = await Service.findById(serviceId);

  if (!service) {
    return res.status(404).json({
      message: "Service not found",
    });
  }

  if (service.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }
  const alreadyExists = service.instances.some((instance) => {
    return instance.url === url;
  });
  if (alreadyExists) {
    return res.status(409).json({
      message: "Instance already exists",
    });
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
async function getInstances(req, res) {
  const id = req.params.id;
  const service = await Service.findById(id);
  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }
  if (service.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return res.status(200).json(service.instances);
}
async function deleteInstance(req, res) {
  const { id, instanceId } = req.params;
  const service = await Service.findById(id);
  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }
  if (service.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const instance = service.instances.id(instanceId);
  if (!instance) {
    return res.status(404).json({
      message: "Instance not found",
    });
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
