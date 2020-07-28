
const { log } = require("../../libs/log");
const { putBackMatchedUser, putBackUser } = require("../../libs/socketMethods");

const finish = (req, res, next) => {
    const currentUser = res.locals.user;
    const current_id = currentUser._id.toString();
    const io = req.app.get("io"); 
            
    currentUser.calling = false;

    /*
    * already finished
    */
    if (!currentUser.matched) {
        currentUser.save();

        // put back the currentUser to others' lists
        putBackUser(currentUser, io);

        return res.status(200).json({
            message: "Already finished",
        })
    }

    /*
    * finish
    */
    const matched_id = currentUser.matched.toString();
    
    // delete my match
    currentUser.matched = undefined;
    currentUser.save();

    res.status(200).json({
        success: true,
    })

    // send message
    putBackMatchedUser(currentUser, matched_id, io);

    log("FINISHED", current_id, matched_id);
}

module.exports = { finish }