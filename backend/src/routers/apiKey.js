const express = require("express");
const {
  createApiKey,
  getMyApiKeys,
  deleteApiKey,
} = require("../controllers/apiKey");
const asyncHandler = require("../../utils/asyncHandler");

const router = express.Router();

router.post("/:serviceId", asyncHandler(createApiKey));
router.get("/", asyncHandler(getMyApiKeys));
router.delete("/:id", asyncHandler(deleteApiKey));

module.exports = router;
