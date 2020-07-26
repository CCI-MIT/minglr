
const express = require("express");

const { getCurrentUser } = require("../middleware/getCurrentUser");
const { log } = require("../libs/log");
const { finish } = require("../middleware/match/finish");
const { cancel } = require("../middleware/match/cancel");
const { cancelConfirm } = require("../middleware/match/cancelConfirm");

const router = express.Router();

/*
* choice 1. choose to proceed with the call
*/
router.get("/proceed", getCurrentUser, (req, res) => {
    const currentUser = res.locals.user;

    if (!currentUser.matched)
        return res.json({
            message: "Already canceled",
        });

    const io = req.app.get("io"); 
    io.to(currentUser.matched.toString()).emit("createCall");

    const current_id = currentUser._id.toString();
    const matched_id = currentUser.matched.toString();

    log("PROCEEDED", current_id, matched_id);
});
// change user status as "calling": both proceeder and proceedee
router.get("/calling", getCurrentUser, (req, res) => {
    const currentUser = res.locals.user;
    if (currentUser.matched) {
        currentUser.calling = true;
        currentUser.save();
    }
})
// change user status as "finished": both finishee and finisher
router.get("/finish", getCurrentUser, finish);


/*
* choice 2. choose to cancel the call: by the canceller
*/ 
router.get("/cancel", getCurrentUser, cancel);

// confirmation by the cancellee
router.get("/cancel_confirm", getCurrentUser, cancelConfirm);


module.exports = router;