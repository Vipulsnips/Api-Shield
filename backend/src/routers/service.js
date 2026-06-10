const express = require("express");
const { restrictTo } = require("../middlewares/auth");
const {
  createService,
  getServiceById,
  getAllServices,
  getMyServices,
  deleteService,
} = require("../controllers/service");
const router = express.Router();

router.post("/", createService);
router.get("/", getAllServices);
router.get("/me", getMyServices);
router.get("/:id", getServiceById);
router.delete("/:id",deleteService);

module.exports = router;
