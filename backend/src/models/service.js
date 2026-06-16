const mongoose = require("mongoose");
const slugify = require("slugify");
const crypto  = require("crypto");
const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    baseurl: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gatewaySecret:{
      type:String,
    },
    healthStatus: {
      type: String,
      enum: ["healthy", "unhealthy"],
      default: "healthy",
    },
    lastChecked: Date,
  },
  { timestamps: true },
);
serviceSchema.pre("save",function(){
   if (!this.isNew) return;
  this.gatewaySecret =  crypto.randomBytes(32).toString("hex");
})
serviceSchema.pre("save", function () {
  if (!this.isModified("name")) return;
  const slugName = slugify(this.name, {
    replacement: "-",
    trim: true,
    lower: true,
    strict: true,
  });
  this.slug = slugName;
});
const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;
