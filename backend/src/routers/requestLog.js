const express = require("express");
const { getRequestLogsById, getSummaryOfRequestLog} = require("../controllers/requestLog");
const verifyServiceOwnership = require("../middlewares/verifyServiceOwnership");
const asyncHandler = require("../../utils/asyncHandler");
const router = express.Router();

router.get("/service/:serviceId/logs",verifyServiceOwnership,asyncHandler(getRequestLogsById));
router.get("/service/:serviceId",verifyServiceOwnership, asyncHandler(getSummaryOfRequestLog));

module.exports = router;
