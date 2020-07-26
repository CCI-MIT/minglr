
const { putBackUser } = require("../../libs/socketMethods");

const cancelConfirm = (req, res, next) => {
    const currentUser = res.locals.user;
    const io = req.app.get("io"); 
    
    if (!currentUser.matched) {
        return res.status(200).json({
            message: "Already canceled",
        });
    }

    // delete match
    currentUser.matched = undefined;
    currentUser.save();

    res.status(200).json({
        success: true,
    })

    // put the cancellee back to the others' lists
    putBackUser(currentUser, io);
}
module.exports = { cancelConfirm }