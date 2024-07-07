const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');

//&Import Files 
const connectDB = require("./DB/connection")
const userRouter = require('./Routes/userRoutes');
const server = require("http").createServer(app) //?Creating server for both socketio and Express app
const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
}

)


//&MiddleWares
app.use(cors({
    origin: "https://chat-application-client-two.vercel.app"  //?Allowing access only to this source
    // 
}));
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


    socket.on("sendMessage", ({ senderId, receiverId, message, conversationId }) => {
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        if (receiver) {
            const data = {
                senderId,
                message,
                conversationId
            }
            io.to(receiver.socketId).to(sender.socket).emit('getMessage', data)
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

})




const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
    console.log("Server Started on ", PORT);
    connectDB();
})