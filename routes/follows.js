
const express = require("express");
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;

const { User } = require("../schemas/User");

const log = require("../libs/log");
const unfollow = require("../libs/unfollow");

router.delete("/unfollow/:user_id", (req,res) => {
    const current_id = req.cookies.w_id;

    try {
        User.findOne({id: req.params.user_id}).then(user => {

            // check if your id doesn't match the id of the user you want to unfollow
            if (user._id.toString() === current_id) {
                return res.status(400).json({ success: false, message: 'You cannot unfollow yourself' })
            }
            else {

                // first update the list of the other user
                const io = req.app.get("io"); 
                User.findById(current_id).then(currentUser => {
                    io.to(user._id.toString()).emit("greet", {
                        type: "REMOVE",
                        user_id: currentUser.id,
                    });

                    io.to(user._id.toString()).emit("approach", {
                        type: "ADD",
                        user: currentUser.getData(),
                        following: "unfollowing",
                    });
                })

                // remove the id of the user you want to unfollow from following array
                unfollow(current_id, user._id);
                
                res.status(200).json({
                    success: true,
                })

                // log
                console.log("* UNFOLLOW: unfollowing", user.id, "by", current_id, new Date().toISOString());
                log("UNFOLLOW", current_id, user._id);
            }
            
        });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message })
    }
});

router.post("/follow/:user_id", (req,res) => {
    try {
        const current_id = req.cookies.w_id;

        // check if the requested user and :user_id is same if same then 
        if (current_id === req.params.user_id) {
            return res.status(200).json({ 
                success: false,
                message: "You cannot follow yourself"
            })
        }

        User.findById(current_id).then(currentUser => {
            User.findOne({id: req.params.user_id}).then(user => {

                // check if the requested user is already in follower list of other user then 
                if (user.isFollowedBy(current_id)) {
                    return res.json({ 
                        success: false,
                        message: "You are already waiting for the user"
                    });
                }
                else if (user.isFollowing(current_id)) {
                    return res.json({
                        success: false,
                        message: "This user is currently waiting for you. Please look at the right panel."
                    })
                }
                user.followers.unshift(currentUser._id);
                user.save()

                currentUser.followings.unshift(user._id);
                currentUser.save();

                res.status(200).json({
                    success: true,
                    currentUser: currentUser.getData(),
                })

                // update the other user's list
                const io = req.app.get("io"); 
                io.to(user._id.toString()).emit("approach", {
                    type: "REMOVE",
                    user_id: currentUser.id,
                });
                io.to(user._id.toString()).emit("greet", {
                    type: "ADD",
                    user: currentUser.getData(),
                });

                // log
                console.log("* FOLLOW: following", user.id, "by", current_id, new Date().toISOString());
                log("FOLLOW", current_id, user._id);
            })
        })
    } catch (err) {console.error(err)}
})

module.exports = router;