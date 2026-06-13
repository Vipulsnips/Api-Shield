const ApiKey = require("../models/apiKey");

async function validateApiKey(req,res,next) {
  const key = req.headers["x-api-key"];
  if (!key)
    return res.status(401).json({
      message: "API Key required",
    });
  const apiKey = await ApiKey.findOne({ key, active: true });
  if (!apiKey)
    return res.status(401).json({
      message: "Invalid API Key",
    });
  req.apiKey = apiKey;
  return next();
}  

module.exports = validateApiKey