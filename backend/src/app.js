const express = require("express");
const connectToMongoDB = require("./connect");
const app = express();
const authRouter = require("./routers/auth");
const serviceRouter = require("./routers/service");
const apiKeyRouter = require("./routers/apiKey");
const { checkForAuthentication } = require("./middlewares/auth");
const gatewayRouter = require("./routers/gateway");

const PORT = 8000;
connectToMongoDB("mongodb://127.0.0.1:27017/apishield")
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log(err));

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/services",checkForAuthentication,serviceRouter);
app.use("/api/apiKeys",checkForAuthentication,apiKeyRouter);
app.use("/api/gateway",gatewayRouter);
app.listen(PORT, () => {
  console.log(`server working at ${PORT}`);
});
