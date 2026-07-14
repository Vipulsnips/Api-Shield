require("dotenv").config();
require("./jobs/healthCheck");

const connectToMongoDB = require("./connect");
const redisClient = require("./config/redis");
const app = require("./app");

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    await connectToMongoDB(process.env.MONGO_URL);
    console.log("MongoDB connected");

    await redisClient.connect();
    console.log("Redis connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

startServer();