const Service = require("../models/service");
const axios = require("axios");
const crypto = require("crypto");
async function createService(req, res) {
  const { name, baseurl } = req.body;
  if (!name || !baseurl) {
    return res.status(400).json({
      message: "Name and baseurl required",
    });
  }
  try {
    new URL(baseurl);
  } catch {
    return res.status(400).json({ message: "Invalid baseurl" });
  }
  const user = req.user;
  const service = await Service.create({
    name,
    baseurl,
    owner: user._id,
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
module.exports = {
  createService,
  getAllServices,
  getServiceById,
  deleteService,
  getMyServices,
  checkHealthById,
  rotateGatewaySecret,
};
