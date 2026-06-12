const { request } = require("express");
const mongoose = require("mongoose");

const requestLogSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
  },
  apiKey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "apiKey",
  },
  statusCode: Number,
  method: String,
  path: String,
  responseTime: Number,
  createdAt: {
    type: Date,
    default:  Date.now
  },
});
const RequestLog = mongoose.model("RequestLog", requestLogSchema);
module.exports = RequestLog;
