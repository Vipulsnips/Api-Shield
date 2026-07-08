const express = require("express");
const handleRequest = require("../controllers/gateway");
const validateApiKey = require("../middlewares/validateApiKey");
const rateLimiter = require("../middlewares/rateLimiter");
const asyncHandler = require("../../utils/asyncHandler");
const router = express.Router();

router.all("/:slug",validateApiKey,rateLimiter,asyncHandler(handleRequest));
router.all("/:slug/*rest",validateApiKey,rateLimiter,asyncHandler(handleRequest));

module.exports = router;