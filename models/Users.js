const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
        default: "https://tse2.mm.bing.net/th?id=OIP.7tlP1ph61ompULJdycVJlQHaHa&pid=Api&P=0&h=180"
    },
    theme: {
        type: String,
        default: "light"
    }

})


const Users = mongoose.model("User", userSchema);




module.exports = Users;