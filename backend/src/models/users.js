const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true,
  },
  role:{
      type: String,
      enum: ["admin", "user"],
      default: "user"
  }
},{timestamps:true});
userSchema.pre('save',async function(){
  if (!this.isModified("password")) return;
  const password = this.password;
  const hashedPassword = await bcrypt.hash(password,10);
  this.password=hashedPassword;
})
userSchema.methods.matchPassword= async function(password){
  return await bcrypt.compare(password,this.password);
}
const User=mongoose.model('User',userSchema);
module.exports = User