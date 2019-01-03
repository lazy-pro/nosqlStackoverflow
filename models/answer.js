let mongoose = require('mongoose');

let answerSchema = mongoose.Schema({
    questionid: {
        type: String,
        required: true
    },
    answeredby: {
        type: String,
        required: true
    },
    ansbody: {
        type: String,
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
    answerer: {
        type: String,
        required: true
    }
});

let Answer = module.exports = mongoose.model('Answer', answerSchema);
