const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const Message = require('./models/Messages')

//&Import Files 
const connectDB = require("./DB/connection")
const userRouter = require('./Routes/userRoutes');
const Conversation = require('./models/Conserversations');
const server = require("http").createServer(app) //?Creating server for both socketio and Express app
const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
}

)


//&MiddleWares
app.use(cors(
    {
        origin: "https://chat-application-client-two.vercel.app"  //?Allowing access only to this source
    }
));
app.use(express.json());        //?Add body in request
app.use('/api/', userRouter);


//&Socket IO
let users = [];
io.on('connection', socket => {

    socket.on('addUser', userId => {
        if (userId === '') return false
        const isUserExists = users.find(currUser => currUser.userId === userId);
        if (!isUserExists) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit('getUsers', users)
        }
    })

    socket.on("removeUser", (userId) => {
        users = users.filter(curr => curr.userId !== userId);
        io.emit("getUsers", users)

    })


    socket.on("sendMessage", ({ senderId, receiverId, message, conversationId, time, date, _id = "" }) => {

        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        const data = {
            senderId,
            message,
            conversationId,
            time,
            date,
            _id
        }
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', data)
            io.to(receiver.socketId).to(sender.socketId).emit('getLatestMessage', data)
        } else {
            io.to(sender.socketId).emit('getMessage', data)
            io.to(sender.socketId).emit('getLatestMessage', data)
        }
    })


    socket.on("createConversation", ({ fullName, email, image, conversationId, userId, receiverId }) => {
        const receiver = users.find(user => user.userId === receiverId);
        if (receiver) {
            const data = {
                fullName,
                email,
                image,
                conversationId,
                userId,
            }
            io.to(receiver.socketId).emit('getConversation', data)
        }
    })

    socket.on("clearChat", ({ senderId, receiverId, conversationId }) => {
        const sender = users.find(user => user.userId === senderId);
        const receiver = users.find(user => user.userId === receiverId);
        const data = { messages: [], conversationId, ClearChat: true }
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getClearedChat', data)
            io.to(receiver.socketId).to(sender.socketId).emit('getLatestMessage', data)
        } else {
            io.to(sender.socketId).emit('getLatestMessage', data)
            io.to(sender.socketId).emit('getClearedChat', data)
        }
    })

    socket.on("deleteConversation", ({ senderId, receiverId }) => {
        const sender = users.find(user => user.userId === senderId);
        const receiver = users.find(user => user.userId === receiverId);
        const data = {}
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getDelteConversation', data)
        } else {
            io.to(sender.socketId).emit('getDelteConversation', data)
        }
    })
    socket.on("getMessagesAfterDelete", async ({ senderId, receiverId, conversationId }) => {
        const sender = users.find(user => user.userId === senderId);
        const receiver = users.find(user => user.userId === receiverId);
        const messagess = await Message.find({ conversationId })
        console.log("SENDER", sender)
        console.log("RECEIVER", receiver)
        const data = await Conversation.findOne({ _id: conversationId })
        if (messagess.length !== 0) {
            if (data.latestMessage !== messagess[messagess.length - 1].message || data.latestMessageTime !== messagess[messagess.length - 1].time) {

                let obj = {
                    message: messagess[messagess.length - 1].message,
                    time: messagess[messagess.length - 1].time,
                    conversationId
                }
                await Conversation.updateOne(
                    { "_id": conversationId },
                    { $set: { "latestMessage": obj.message, "latestMessageTime": obj.time } }
                )
                if (receiver) {
                    io.to(receiver.socketId).to(sender.socketId).emit('getLatestMessage', obj)
                } else {
                    io.to(sender.socketId).emit('getLatestMessage', obj)
                }
            }
        } else {
            await Conversation.updateOne(
                { "_id": conversationId },
                { $set: { "latestMessage": "" } }
            )
            let obj = {
                ClearChat: true,
                conversationId
            }
            if (receiver) {
                io.to(receiver.socketId).to(sender.socketId).emit('getLatestMessage', obj)
            } else {
                io.to(sender.socketId).emit('getLatestMessage', obj)
            }
        }


        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessagessAfterDeleting', messagess)
        } else {
            io.to(sender.socketId).emit('getMessagessAfterDeleting', messagess)
        }
    })
})


const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
    console.log("Server Started on ", PORT);
    connectDB();
})