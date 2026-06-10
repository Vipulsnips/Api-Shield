const mongoose = require("mongoose");
const { applyTimestamps } = require("./users");
const slugify = require("slugify");
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
  },
  { timestamps: true },
);

serviceSchema.pre("save", function () {
  if (!this.isModified('name')) return;
  const slugName = slugify(this.name, {
    replacement: "-",
    trim: true,
    lower:true,
    strict:true
  });
  this.slug = slugName;
  
});
const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;
