const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
    key:{
        type:String,
        required:true,
        unique:true
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

const apiKey=mongoose.model('apiKey',apiKeySchema);
module.exports = apiKey