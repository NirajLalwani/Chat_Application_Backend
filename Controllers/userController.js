const asyncHandler = require("../utils/asyncHandler")
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken")

//~Models
const Users = require("../models/Users")
const Conversation = require('../models/Conserversations')
const Messages = require("../models/Messages");
const Message = require("../models/Messages");




// ********************************************************************
const Register = asyncHandler(async (req, res, next) => {
    const { fullName, email, password, image } = req.body;
    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "Please Fill all the Fields" })
    } else {
        const isAlreadyExist = await Users.findOne({ email })
        if (isAlreadyExist) {
            return res.status(400).json({ message: "User Already Exists" })
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            if (image !== '') {
                var newUser = Users.create({ fullName, email, password: hashedPassword, image })
            } else {
                var newUser = Users.create({ fullName, email, password: hashedPassword })
            }
            return res.status(200).json({ message: "User Registered Successfully", newUser })
        }
    }
})
// ********************************************************************




// ********************************************************************
const Login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please Fill all the Fields" })
    } else {
        const user = await Users.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Invalid Email or Password" })
        } else {

            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (isPasswordMatch) {
                const payload = {
                    userId: user._id,
                    email: user.email,
                    image: user.image,
                    name: user.fullName
                }

                const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: 84600 })  //?Expires JWT token in 1day, 84600seconds = 1day
                await user.save();

                return res.status(200).json({ "Message": "User Login Successfully", token })

            } else {
                return res.status(400).json({ message: "Invalid Email or Password" })
            }
        }
    }
})
// ********************************************************************




// ********************************************************************
const CreateConversationFunction = asyncHandler(async (req, res, next) => {

    const { senderId, receiverId } = req.body;
    const isExists = await Conversation.find({ $or: [{ User_1: senderId, User_2: receiverId }, { User_2: senderId, User_1: receiverId }] })
    if (isExists.length == 0) {     //?if UserConversation is not exists then only creating the conversation
        const conver = await Conversation.create({ User_1: senderId, User_2: receiverId });
        return res.status(200).json({ _id: conver._id, message: "Conversation Created Successfully" })
    }
})
// ********************************************************************




// ********************************************************************
const GetConversationFunction = asyncHandler(async (req, res, next) => {
    const userId = req.params.userId;
    const isValidUserId = await Users.findById(userId);
    if (isValidUserId) {            //?If userId is Valid i.e if user with this id exists then only send the conversation
        const allConverstion = await Conversation.find({ $or: [{ User_1: userId }, { User_2: userId }] })


        const OtherUserData = await Promise.all(allConverstion.map(async ({ User_1, User_2, _id, latestMessage }) => {             //?Mapping all conversation to send only receiver's data

            let secondUserId = (User_1 === userId) ? User_2 : User_1;  //?Finding which one is receiver

            let CurrUser = await Users.findOne({ _id: secondUserId }, { password: 0, __v: 0 }); //?Finding reciver's data


            if (CurrUser) {
                CurrUser = {                                //?Final Data
                    fullName: CurrUser.fullName,
                    email: CurrUser.email,
                    image: CurrUser.image,
                    ConversationId: _id,
                    userId: CurrUser._id,
                    latestMessage: latestMessage
                }
                return CurrUser
            }
        }))

        return res.status(200).json({ OtherUserData }) //?Sending all Conversation Data

    } else {
        return res.status(400).json({ "message": "User Not Found" }) //?If Sender id is invalid
    }
})
// ********************************************************************




// ********************************************************************
const CreateMessageFunction = asyncHandler(async (req, res, next) => {
    const { conversationId, senderId, message } = req.body;
    if (!senderId || !message) return res.status(400).json({ message: "Please Fill all required fields" })
    await Message.create({ conversationId, senderId, message });
    await Conversation.updateOne(
        { "_id": conversationId },
        { $set: { "latestMessage": message } }
    )
    return res.status(200).json({ message: 'Message sent   successfully' });

})
// ********************************************************************




// ********************************************************************
const GetMessageFunction = asyncHandler(async (req, res, next) => {
    const conversationId = req.params.conversationId;
    const messages = await Messages.find({ conversationId })
    res.status(200).json({ Data: messages });
})
// ********************************************************************




// ********************************************************************
const GetAllUsers = asyncHandler(async (req, res, next) => {

    const users = await Users.find({}, { password: 0, __v: 0, token: 0 });
    res.status(200).json({ Data: users })

})
// ********************************************************************




// ********************************************************************
const GetUser = asyncHandler(async (req, res, next) => {

    const token = req.params.token;
    try {

        const payload = jwt.verify(token, process.env.SECRET_KEY); //?Finding the payload of the data
        if (payload) {
            const userExists = await Users.findById(payload.userId);    //?Double Checking the user with useId stored in payload Exists or not
            if (userExists) {   //?If User Exists The Sending UserData in the Resopnse
                return res.status(200).json({ userId: payload.userId, image: payload.image, email: payload.email, fullName: payload.name })
            }
        }
        return res.status(400).json({ message: "Not Valid User" });
    } catch (error) {
        return res.status(400).json({ message: "Not Valid User" });
    }

})
// ********************************************************************




module.exports = { Register, Login, GetConversationFunction, CreateMessageFunction, GetMessageFunction, GetAllUsers, GetUser, CreateConversationFunction }