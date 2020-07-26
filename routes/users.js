const express = require("express");

const { User } = require("../schemas/User");

const { log } = require("../libs/log");
const { getCurrentUser } = require("../middleware/getCurrentUser");

const router = express.Router();

router.get("/users/:user_id", (req, res) => {
    const current_id = req.cookies.w_id;

    try {
        if (!current_id || current_id === undefined || current_id.length === 0 || current_id === "undefined") 
            return res.json({
                success: false,
                message: "user not authorized",
            });

        User.findOne({id: req.params.user_id}).then(clickedUser => { // followed user

            if (!clickedUser) {
                return res.status(200).json({
                    success: false,
                    message: "wrong user id sent",
                })
            }

            let newFollowers = [];

            clickedUser.followers.forEach(function(_id) {
                User.findById(_id).then(u => {
                    if (u.available)
                        newFollowers.push(u.getData());
                })
            });

            if (clickedUser.matched) {
                User.findById(clickedUser.matched).then(matchedUser => {
                    res.status(200).json({
                        success: true,
                        user: clickedUser.getData(),
                        followers: newFollowers,
                        matched: matchedUser.getData(),
                    })
                })

            }
            else {
                res.status(200).json({
                    success: true,
                    user: clickedUser.getData(),
                    followers: newFollowers,
                })
            }

            console.log("* CLICKED: ", clickedUser.id, "by", current_id, new Date().toISOString());
            log("CLICKED", current_id, clickedUser._id);
        });
    } catch (err) {console.error(err)}
                
});
router.get("/approach", getCurrentUser, (req, res) => {
    const user = res.locals.user;
    const current_id = user._id.toString();

    User.find({}, function(err, allUsers) {
        let newRest = [];
        let newFollowings = [];
        allUsers.forEach(function(u) {

            if (u._id == current_id || !u.available) {}
            else if (user.isFollowing(u._id)) {
                newFollowings.push(u.getData())
            }
            else if (!user.isFollowedBy(u._id)) {
                newRest.push(u.getData())
            }
        });

        return res.status(200).json({
            success: true,
            followings: newFollowings,
            rest: newRest
        });
    });

});

router.get("/greet", getCurrentUser, (req, res) => {
    const user = res.locals.user;
    const current_id = user._id.toString();
            
    User.find({}, function(err, allUsers) {
        if (err) console.error(err);

        let newFollowers = [];
        allUsers.forEach(function(u) {

            if (u._id == current_id || !u.available || u.matched) {}
            else if (user.isFollowedBy(u._id)) {
                newFollowers.push(u.getData());
            }
        });

        return res.status(200).json({
            success: true,
            followers: newFollowers,
        });
    });
});

router.post("/search", getCurrentUser, (req, res) => {
    const user = res.locals.user;
    const current_id = user._id.toString();

    console.log("* SEARCHED: ", req.body.value, "by", current_id, new Date().toISOString());
    log("SEARCH", current_id, req.body.value);
})

module.exports = router;