const ApiKey = require("../models/apiKey");
const Service = require("../models/service");
async function createApiKey(req, res) {
  const user = req.user;
  const serviceId = req.params.serviceId;
  if (!serviceId)
    return res.status(400).json({ message: "Id is not provided." });
  const service = await Service.findById(serviceId);
  if (!service) return res.status(404).json({ message: "Service not found" });
  if (user._id.toString() !== service.owner.toString())
    return res.status(403).json({ message: "Forbidden" });
  const apiKey = await ApiKey.create({
    service: service._id,
    owner: user._id,
  });
  return res.status(201).json(apiKey);
}
async function getMyApiKeys(req, res) {
  const myApiKeys = await ApiKey.find({owner : req.user._id});
  return res.json(myApiKeys);
}
async function deleteApiKey(req, res) {
  const user = req.user;
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: "Id is not provided." });
  const apiKey = await ApiKey.findById(id);
  if (!apiKey) return res.status(400).json({ message: "No such key exists." });
  if (user._id.toString() !== apiKey.owner.toString())
    return res.status(403).json({ message: "Forbidden" });
  await ApiKey.findByIdAndDelete(id);
  return res.status(202).json({ message: "Successfull", apiKey });
}

module.exports = {
  createApiKey,
  getMyApiKeys,
  deleteApiKey,
};
