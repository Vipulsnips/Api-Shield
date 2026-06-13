function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
    });
  }
  return res.status(500).json({
    message: "Internal Server Error",
  });
}

module.exports = errorHandler;
