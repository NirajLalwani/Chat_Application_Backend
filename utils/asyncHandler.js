const asyncHandler = (func) => (req, res, next) => {
    try {
        func(req, res, next).then(() => console.log()).catch((error) => {
            console.log("Error Occured", error)
        });
    } catch (error) {
        console.log("Error Occurred In AsyncHandler")
        console.log(error)
        return res.json({ message: `Error Occured ${error}` })
    }

}

module.exports = asyncHandler