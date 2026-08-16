require("dotenv").config();
const cors = require("cors");
const express = require("express");
const compression = require("compression");
const helmet = require("helmet");

const app = express();
const logger = require("./config/logger");
const authRouter = require("./routers/auth");
const serviceRouter = require("./routers/service");
const apiKeyRouter = require("./routers/apiKey");
const gatewayRouter = require("./routers/gateway");
const requestLogRouter = require("./routers/requestLog");

const { checkForAuthentication } = require("./middlewares/auth");
const errorHandler = require("./middlewares/errorHandler");

app.use(express.json());
app.use(compression());
app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
  }),
);

app.get("/", (req, res) => {
  res.json({
    message: "APIShield API is running",
    frontend_url: process.env.FRONTEND_URL,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/services", checkForAuthentication, serviceRouter);
app.use("/api/apiKeys", checkForAuthentication, apiKeyRouter);
app.use("/api/gateway", gatewayRouter);
app.use("/api/analytics", checkForAuthentication, requestLogRouter);

app.use(errorHandler);

module.exports = app;