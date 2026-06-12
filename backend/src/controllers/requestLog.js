const mongoose = require("mongoose");
const RequestLog = require("../models/requestLog");
async function getRequestLogsById(req, res) {
  const serviceId = req.params.serviceId;
  if (!serviceId)
    return res.status(400).json({
      message: "Service Id not provide",
    });
  const requestLogs = await RequestLog.find({
    service: serviceId,
  });
  return res.status(200).json(requestLogs);
}

async function getSummaryOfRequestLog(req, res) {
  const serviceId = req.params.serviceId;
  if (!serviceId)
    return res.status(400).json({
      message: "Service Id not provide",
    });
  const result = await RequestLog.aggregate([
    {
      $match: {
        service: new mongoose.Types.ObjectId(serviceId),
      },
    },
    {
      $group: {
        _id: null,
        totalRequests: {
          $sum: 1,
        },
        avgResponseTime: {
          $avg: "$responseTime",
        },
        successRequests: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $gte: ["$statusCode", 200],
                  },
                  {
                    $lt: ["$statusCode", 300],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);
  if (result.length === 0) {
    return res.status(200).json({
      totalRequests: 0,
      successRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,
    });
  }
  const stats = result[0];
  const failedRequests = stats.totalRequests - stats.successRequests;
  return res.status(200).json({
    totalRequests: stats.totalRequests,
    successRequests: stats.successRequests,
    failedRequests,
    avgResponseTime: stats.avgResponseTime,
  });
}

async function getAllRequestLogs(req, res) {
  const allRequestLogs = await RequestLog.find({});
  return res.status(200).json(allRequestLogs);
}

module.exports={
  getRequestLogsById,
  getSummaryOfRequestLog,
  getAllRequestLogs
}