
const express = require("express");
const ObjectId = require('mongodb').ObjectID;

const { User } = require("../schemas/User");
const { Log } = require("../schemas/Log");

const router = express.Router();

router.delete("/unfollow/:user_id", (req,res) => {
    const current_id = new ObjectId(req.cookies.w_id);

    try {
        User.findOne({id: req.params.user_id}).then(user => {

            // check if your id doesn't match the id of the user you want to unfollow
            if (user._id === current_id) {
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
                const query = {
                    _id: current_id
                }

                const update = {
                    $pull: { followings: {_id: user._id }}
                }

                const updated = User.updateOne(query, update, {
                    safe: true
                }, function(err, obj) {
                    if (err) console.error(err);
                })

                // remove your id from the followers array of the user you want to unfollow
                const secondQuery = {
                    _id: user._id
                }

                const secondUpdate = {
                    $pull: { followers: {_id: current_id} }
                }

                User.updateOne(secondQuery, secondUpdate, {
                    safe: true
                }, function(err, obj) {
                    res.status(200).json({
                        success: true,
                    })

                    console.log("* UNFOLLOW: unfollowing", user.id, "by", current_id, new Date().toISOString());
        
                    const log = new Log({
                        kind: "UNFOLLOW",
                        content: user._id,
                        user: current_id
                    })
                
                    log.save((err, doc) => {
                        if (err) console.error(err)
                    })
                })
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
                if (user.followers.findIndex(follower => follower._id.toString() === current_id) >= 0) {
                    return res.json({ 
                        success: false,
                        message: "You are already waiting for the user"
                    });
                }
                else if (user.followings.findIndex(following => following._id.toString() === current_id) >= 0) {
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

                const io = req.app.get("io"); 
                // update the other user's list
                io.to(user._id.toString()).emit("approach", {
                    type: "REMOVE",
                    user_id: currentUser.id,
                });
                io.to(user._id.toString()).emit("greet", {
                    type: "ADD",
                    user: currentUser.getData(),
                });

                console.log("* FOLLOW: following", user.id, "by", current_id, new Date().toISOString());

                const log = new Log({
                    kind: "FOLLOW",
                    content: user._id,
                    user: current_id
                });
            
                log.save((err, doc) => {
                    if (err) console.error(err)
                });
            })
        })
    } catch (err) {console.error(err)}
})

module.exports = router;