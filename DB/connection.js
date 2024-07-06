const mongoose = require('mongoose');

const connectDB = async () => {
    try {

        const connection = await mongoose.connect(process.env.DB);
        if (connection) {
            console.log("Connected to DB Successfully")
        } else {
            console.log("Error Occurred while connecting to Database")
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = connectDB;