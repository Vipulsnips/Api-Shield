const Service = require("../models/service");

async function createService(req, res) {
  const { name, baseurl } = req.body;
  const user = req.user;
  const service = await Service.create({
    name,
    baseurl,
    owner: user._id,
  });
  return res.status(201).json(service);
}
async function getAllServices(req, res) {
  const allServices = await Service.find({});
  return res.json(allServices);
}
async function getServiceById(req, res) {
  const id = req.params.id;
  if (!id)
    return res.status(400).json({
      message: "Id required",
    });
  const service = await Service.findById(id);
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
  const services = await Service.find({ owner });
  return res.json(services);
}
module.exports = {
  createService,
  getAllServices,
  getServiceById,
  deleteService,
  getMyServices,
};
