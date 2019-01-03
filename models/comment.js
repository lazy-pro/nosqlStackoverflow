let mongoose = require('mongoose');

let commentSchema = mongoose.Schema({
    questionid:{
        type:String,
        required:true
    },
    answerid:{
        type:String
    },
    cbody:{
        type:String,
        required:true
    },
    flag: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    upvotes:{
        type: Number,
        default:0
    },
    downvotes:{
        type: Number,
        default:0
    },
    commenter: {
        type: String,
        required: true
    },
    commenterid: {
        type: String,
        required: true
    }
});

let Comment = module.exports = mongoose.model('Comment', commentSchema);
