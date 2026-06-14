const express = require("express");
const { getRequestLogsById, getSummaryOfRequestLog} = require("../controllers/requestLog");
const verifyServiceOwnership = require("../middlewares/verifyServiceOwnership");
const router = express.Router();

router.get("/service/:serviceId/logs",verifyServiceOwnership,getRequestLogsById);
router.get("/service/:serviceId",verifyServiceOwnership, getSummaryOfRequestLog);

module.exports = router;
