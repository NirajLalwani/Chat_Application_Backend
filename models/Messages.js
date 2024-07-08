const mongoose = require('mongoose');

const messagesSchema = mongoose.Schema({
    conversationId: {
        type: String,
        required: true,
    },
    senderId: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    time: {
        type: String,
    },
    date: {
        type: String,
    }
})


const Messages = mongoose.model("Message", messagesSchema);




module.exports = Messages;
