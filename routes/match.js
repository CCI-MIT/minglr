
const express = require("express");

const { getCurrentUser } = require("../middleware/getCurrentUser");
const { getCurrentGroup } = require("../middleware/getCurrentGroup");
const { log } = require("../libs/log");
const { finish } = require("../middleware/match/finish");
const { cancel } = require("../middleware/match/cancel");
const { cancelConfirm } = require("../middleware/match/cancelConfirm");

const router = express.Router();

/*
* choice 1. choose to proceed with the call
*/
router.get("/proceed", getCurrentUser, getCurrentGroup, (req, res) => {
    const currentUser = res.locals.user;
    const current_id = currentUser._id.toString();
    const matched_id = currentUser.matched.toString();

    if (!currentUser.matched)
        return res.json({
            message: "Already canceled",
        });


    const io = req.app.get("io"); 
    const groupIO = io.of(`/group${currentUser.available.toString()}`);
    groupIO.to(matched_id).emit("createCall");

    log("PROCEEDED", current_id, matched_id);
});
// change user status as "calling": both proceeder and proceedee
router.get("/calling", getCurrentUser, getCurrentGroup, (req, res) => {
    const currentUser = res.locals.user;
    if (currentUser.matched) {
        currentUser.calling = true;
        currentUser.save();
    }
})
// change user status as "finished": both finishee and finisher
router.get("/finish", getCurrentUser, getCurrentGroup, finish);


/*
* choice 2. choose to cancel the call: by the canceller
*/ 
router.get("/cancel", getCurrentUser, getCurrentGroup, cancel);

// confirmation by the cancellee
router.get("/cancel_confirm", getCurrentUser, getCurrentGroup, cancelConfirm);


module.exports = router;