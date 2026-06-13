const redisClient = require("../config/redis");
const LIMIT = 10;
async function rateLimiter(req, res, next) {
  const redisKey = `rate_limit:${req.apiKey._id}`;
  const cnt = await redisClient.get(redisKey);
  if (!cnt) {
    await redisClient.set(redisKey, 1, { EX: 60 });
    return next();
  }
  const currentCount = Number(cnt);
  if (currentCount >= LIMIT) {
    return res.status(429).json({
      message: "Rate limit exceeded",
    });
  }
  await redisClient.incr(redisKey);

  return next();
}

module.exports = rateLimiter;
