const express = require("express");
const connectToMongoDB = require("./connect");
const app = express();
const authRouter = require("./routers/auth");
const serviceRouter = require("./routers/service");
const apiKeyRouter = require("./routers/apiKey");
const { checkForAuthentication } = require("./middlewares/auth");
const gatewayRouter = require("./routers/gateway");
const RequestLogRouter = require("./routers/requestLog");
const redisClient = require("./config/redis");

const PORT = 8000;

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/services",checkForAuthentication,serviceRouter);
app.use("/api/apiKeys",checkForAuthentication,apiKeyRouter);
app.use("/api/gateway",gatewayRouter);
app.use("/api/analytics",RequestLogRouter);
async function startServer() {
  try {
    await connectToMongoDB("mongodb://127.0.0.1:27017/apishield");
    console.log("mongodb connected");

    await redisClient.connect();
    console.log("redis connected"); 

    app.listen(PORT, () => {
      console.log(`server working at ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}

startServer();
