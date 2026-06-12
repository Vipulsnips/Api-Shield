const express = require("express");
const { getRequestLogsById, getSummaryOfRequestLog, getAllRequestLogs } = require("../controllers/requestLog");
const router = express.Router();

router.get("/service/dashboard", getAllRequestLogs);
router.get("/service/:serviceId/logs", getRequestLogsById);
router.get("/service/:serviceId", getSummaryOfRequestLog);

module.exports = router;
