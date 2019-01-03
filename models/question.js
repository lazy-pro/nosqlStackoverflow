let mongoose = require('mongoose');

let questionSchema = mongoose.Schema({
    askedby: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    qbody: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date,
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
    tags: [{type: String}],
    asker:{
        type:String,
        required: true
    }
});

let Question = module.exports = mongoose.model('Question', questionSchema);
