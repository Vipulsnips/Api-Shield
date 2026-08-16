const logger = require("../config/logger");

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  logger.error(
    {
      error: err.message,
      statusCode,
      method: req.method,
      path: req.originalUrl,
      stack: err.stack,
    },
    "Request failed",
  );

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
    });
  }

  return res
    .status(statusCode)
    .json({ message: err.message || "Internal server error" });
}

module.exports = errorHandler;