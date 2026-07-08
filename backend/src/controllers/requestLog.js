const mongoose = require("mongoose");
const RequestLog = require("../models/requestLog");
async function getRequestLogsById(req, res, next) {
  const serviceId = req.params.serviceId;
  if (!serviceId) {
    const error = new Error("Service does not exist.");
    error.statusCode = 404;
    return next(error);
  }
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    const error = new Error("Invalid service id");
    error.statusCode = 400;
    return next(error);
  }
  const requestLogs = await RequestLog.find({
    service: serviceId,
  });
  return res.status(200).json(requestLogs);
}

async function getSummaryOfRequestLog(req, res, next) {
  const serviceId = req.params.serviceId;
  if (!serviceId) {
    const error = new Error("Service does not exist.");
    error.statusCode = 404;
    return next(error);
  }
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    const error = new Error("Invalid service id");
    error.statusCode = 400;
    return next(error);
  }
  const serviceObjectId = new mongoose.Types.ObjectId(serviceId);
  const result = await RequestLog.aggregate([
    {
      $match: {
        service: serviceObjectId,
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
  const instanceStats = await RequestLog.aggregate([
    {
      $match: {
        service: serviceObjectId,
      },
    },
    {
      $group: {
        _id: "$instanceUrl",

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
                  { $gte: ["$statusCode", 200] },
                  { $lt: ["$statusCode", 300] },
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
  const instances = instanceStats.map((instance) => ({
    instanceUrl: instance._id,
    totalRequests: instance.totalRequests,
    successRequests: instance.successRequests,
    failedRequests: instance.totalRequests - instance.successRequests,
    avgResponseTime: Number(instance.avgResponseTime.toFixed(2)),
  }));
  if (result.length === 0) {
    return res.status(200).json({
      totalRequests: 0,
      successRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,
      instances: instances,
    });
  }
  const stats = result[0];
  const failedRequests = stats.totalRequests - stats.successRequests;
  return res.status(200).json({
    totalRequests: stats.totalRequests,
    successRequests: stats.successRequests,
    failedRequests,
    avgResponseTime: Number(stats.avgResponseTime.toFixed(2)),
    instances: instances,
  });
}

module.exports = {
  getRequestLogsById,
  getSummaryOfRequestLog,
};
