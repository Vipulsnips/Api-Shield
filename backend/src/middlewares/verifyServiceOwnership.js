const Service = require("../models/service");
async function verifyServiceOwnership(req, res, next) {
  const serviceId = req.params.serviceId;
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
  next();
}
module.exports = verifyServiceOwnership;
