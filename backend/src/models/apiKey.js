const mongoose = require('mongoose');
const crypto = require('crypto');
const apiKeySchema = new mongoose.Schema({
    key:{
        type:String,
        unique:true
    },
    service:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Service",
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    active:{
        type:Boolean,
        default:true
    }
},{timestamps:true});

apiKeySchema.pre('save',function(){
    if(this.key) return;
    this.key="apsk_"+ crypto.randomBytes(24).toString("hex");
    return;
})

const ApiKey=mongoose.model('ApiKey',apiKeySchema);
module.exports = ApiKey;