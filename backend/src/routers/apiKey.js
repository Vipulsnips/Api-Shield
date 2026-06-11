const express = require("express");
const {
  createApiKey,
  getMyApiKeys,
  deleteApiKey,
} = require("../controllers/apiKey");

const router = express.Router();

router.post("/:serviceId", createApiKey);
router.get("/", getMyApiKeys);
router.delete("/:id", deleteApiKey);

module.exports = router;
