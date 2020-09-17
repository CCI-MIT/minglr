
const { log } = require("../../libs/log");
const { putBackMatchedUser, putBackUser } = require("../../libs/socketMethods");

const finish = (req, res, next) => {
    const currentUser = res.locals.user;
    const group = res.locals.group;

    const current_id = currentUser._id.toString();       
    currentUser.calling = false;

    const io = req.app.get("io"); 
    const groupIO = io.of(`/group${currentUser.available.toString()}`);

    /*
    * already finished
    */
    if (!currentUser.matched) {
        currentUser.save();

        // put back the currentUser to others' lists
        putBackUser(group.activeMembers, currentUser, groupIO);

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
    putBackMatchedUser(group.activeMembers, currentUser, matched_id, groupIO);

    log("FINISHED", current_id, matched_id);
}

module.exports = { finish }