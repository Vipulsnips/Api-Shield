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
  getGatewaySecret
} = require("../controllers/service");
const router = express.Router();

router.post("/", createService);
router.get("/", restrictTo(["admin"]), getAllServices);
router.get("/me", getMyServices);
router.get("/:id/secret", getGatewaySecret);
router.post("/:id/check-health", checkHealthById);
router.post("/:id/rotate-secret", rotateGatewaySecret);
router.get("/:id", getServiceById);
router.delete("/:id", deleteService);

module.exports = router;
