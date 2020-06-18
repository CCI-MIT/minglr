const express = require("express");

const { User } = require("../schemas/User");
const { Log } = require("../schemas/Log");

const router = express.Router();

const isIn = (arr, val) => {
    let result = false;
    arr.forEach(function(ele) {
        if (ele._id.equals(val))
            result = true;
    })
    return result;
}

router.get("/users/:user_id", (req, res) => {
    const current_id = req.cookies.w_id;

    try {
        if (!current_id || current_id === undefined || current_id.length === 0 || current_id === "undefined") return;
        User.findOne({id: req.params.user_id}).then(user => { // followed user

                if (!user) {
                    return res.status(200).json({
                        success: false,
                    })
                }

                let newFollowers = [];

                user.followers.forEach(function(_id) {
                    User.findById(_id).then(u => {
                        if (u.available)
                            newFollowers.push(u.getData());
                    })
                });

                res.status(200).json({
                    success: true,
                    user: user.getData(),
                    followers: newFollowers,
                })

                console.log("* CLICKED: ", user.id, "by", current_id, new Date().toISOString());
                const log = new Log({
                    kind: "CLICKED",
                    content: user._id,
                    user: current_id
                })

                log.save((err, doc) => {
                    if (err) console.error(err)
                })
                
            });
        } catch (err) {console.error(err)}
});
router.get("/approach", (req, res) => {
    const current_id = req.cookies.w_id;

    try {
        if (!current_id || current_id === undefined || current_id.length === 0 || current_id === "undefined") return;
        User.findById(current_id).then(user => {

            if (!user) return res.status(200).json({success: false})
            else {
                User.find({}, function(err, allUsers) {
                    let newRest = [];
                    let newFollowings = [];
                    allUsers.forEach(function(u) {

                        if (u._id == current_id || !u.available) {}
                        else if (isIn(user.followings, u._id)) {
                            newFollowings.push(u.getData())
                        }
                        else if (!isIn(user.followers, u._id)) {
                            newRest.push(u.getData())
                        }
                    });

                    return res.status(200).json({
                        success: true,
                        followings: newFollowings,
                        rest: newRest
                    });
                });
            }
        })
    } catch (err) {console.error(err)}

});

router.get("/greet", (req, res) => {
    const current_id = req.cookies.w_id;

    try {
        if (!current_id || current_id === undefined || current_id.length === 0 || current_id === "undefined") return;

        User.findById(current_id).then(user => {

            if (!user) return res.status(200).json({success: false})
            
            User.find({}, function(err, allUsers) {
                if (err) console.error(err);

                let newFollowers = [];
                allUsers.forEach(function(u) {

                    if (u._id == current_id || !u.available || u.matched) {}
                    else if (isIn(user.followers, u._id)) {
                        newFollowers.push(u.getData());
                    }
                });

                return res.status(200).json({
                    success: true,
                    followers: newFollowers,
                });
            });
        })
    } catch (err) {console.error(err)}
});

router.post("/search", (req, res) => {
    const current_id = req.cookies.w_id;
    try {
        if (!current_id || current_id === undefined || current_id.length === 0 || current_id === "undefined") return;

        console.log("* SEARCHED: ", req.body.value, "by", current_id, new Date().toISOString());
        const log = new Log({
            kind: "SEARCH",
            content: req.body.value,
            user: current_id
        })

        log.save((err, doc) => {
            if (err) console.error(err)
        })
    } catch (err) {console.error(err)}
})

module.exports = router;