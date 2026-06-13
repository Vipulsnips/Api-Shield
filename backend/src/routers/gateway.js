const express = require("express");
const handleRequest = require("../controllers/gateway");
const validateApiKey = require("../middlewares/validateApiKey");
const rateLimiter = require("../middlewares/rateLimiter");
const router = express.Router();

router.all("/:slug",validateApiKey,rateLimiter,handleRequest)
router.all("/:slug/*rest",validateApiKey,rateLimiter,handleRequest)

module.exports = router;