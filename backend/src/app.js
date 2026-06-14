require("dotenv").config();
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
const errorHandler = require("./middlewares/errorHandler");
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.get("/", (req, res) => {
  res.json({
    message: "APIShield API is running",
    docs: "https://github.com/Vipulsnips/Api-Shield#api-endpoints",
  });
});
app.use("/api/auth", authRouter);
app.use("/api/services", checkForAuthentication, serviceRouter);
app.use("/api/apiKeys", checkForAuthentication, apiKeyRouter);
app.use("/api/gateway", gatewayRouter);
app.use("/api/analytics", checkForAuthentication, RequestLogRouter);
app.use(errorHandler);

async function startServer() {
  try {
    await connectToMongoDB(process.env.MONGO_URL);
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
