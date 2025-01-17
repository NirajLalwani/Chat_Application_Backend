


const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
    User_1: {
        type: String,
        required: true
    },
    User_2: {
        type: String,
        required: true
    },
    latestMessage: {
        type: String,
        required: false,
        default: ""
    },
    latestMessageTime: {
        type: String,
        required: false,
        default: ""
    },
    latestMessageDate: {
        type: String
    }
})


const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation