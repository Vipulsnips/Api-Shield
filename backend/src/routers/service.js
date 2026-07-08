const express = require("express");
const { restrictTo } = require("../middlewares/auth");
const {
  createService,
  getServiceById,
  getAllServices,
  getMyServices,
  deleteService,
  checkHealthById,
  rotateGatewaySecret,
  getGatewaySecret,
  addInstance,
  getInstances,
  deleteInstance
} = require("../controllers/service");
const router = express.Router();
const asyncHandler = require("../../utils/asyncHandler");
router.post("/", asyncHandler(createService));
router.get("/", restrictTo(["admin"]), asyncHandler(getAllServices));
router.get("/me", asyncHandler(getMyServices));
router.get("/:id/secret", asyncHandler(getGatewaySecret));
router.post("/:id/check-health", asyncHandler(checkHealthById));
router.post("/:id/rotate-secret", asyncHandler(rotateGatewaySecret));
router.post("/:id/instances",asyncHandler(addInstance))
router.get("/:id/instances",asyncHandler(getInstances))
router.delete("/:id/instances/:instanceId",asyncHandler(deleteInstance))
router.get("/:id", asyncHandler(getServiceById));
router.delete("/:id", asyncHandler(deleteService));
module.exports = router;