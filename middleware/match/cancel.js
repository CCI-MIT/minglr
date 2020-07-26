const { log } = require("../../libs/log");
const { putBackMatchedUser } = require("../../libs/socketMethods");

const cancel = (req, res, next) => {
    const currentUser = res.locals.user;
    
    if (!currentUser.matched)
        return res.json({
            message: "Already canceled",
        })

    const current_id = currentUser._id.toString();
    const matched_id = currentUser.matched.toString();

    // send cancellee the message
    const io = req.app.get("io"); 
    io.to(matched_id).emit("cancelled");

    // delete match
    currentUser.matched = undefined;
    currentUser.save();

    res.status(200).json({
        success: true,
    });

    // show canceller to others
    putBackMatchedUser(currentUser, matched_id, io);
    
    // create log
    log("CANCELLED", current_id, matched_id);
}

module.exports = { cancel }