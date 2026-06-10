const express = require("express");
const connectToMongoDB = require("./connect");
const app = express();
const authRouter = require("./routers/auth");
const serviceRouter = require("./routers/service");
const { checkForAuthentication } = require("./middlewares/auth");

const PORT = 8000;
connectToMongoDB("mongodb://127.0.0.1:27017/apishield")
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log(err));

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/services",checkForAuthentication,serviceRouter);
app.listen(PORT, () => {
  console.log(`server working at ${PORT}`);
});
