const express = require("express");
const { restrictTo } = require("../middlewares/auth");
const {
  createService,
  getServiceById,
  getAllServices,
  getMyServices,
  deleteService,
  checkHealthById
} = require("../controllers/service");
const router = express.Router();

router.post("/", createService);
router.get("/", getAllServices);
router.get("/me", getMyServices);
router.post("/:id/check-health", checkHealthById);
router.get("/:id", getServiceById);
router.delete("/:id",deleteService);

module.exports = router;
