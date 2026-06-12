const express = require("express");
const handleRequest = require("../controllers/gateway");
const router = express.Router();

router.all("/:slug",handleRequest)
router.all("/:slug/*rest",handleRequest)

module.exports = router;