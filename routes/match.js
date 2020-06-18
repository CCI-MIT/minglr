
const express = require("express");
const ObjectId = require('mongodb').ObjectID;

const { User } = require("../schemas/User");
const { Log } = require("../schemas/Log");

const router = express.Router();

router.get("/calling", (req, res) => {
    const current_id = req.cookies.w_id;
    try {
        User.findById(new ObjectId(current_id)).then(currentUser => {
            if (currentUser.matched) {
                currentUser.calling = true;
                currentUser.save();
            }
        })
    } catch (err) {console.error(err)}

})

router.get("/finish", (req, res) => {
    const current_id = req.cookies.w_id;
    
    try {
        User.findById(new ObjectId(current_id)).then(currentUser => {
            
            currentUser.calling = false;
            const io = req.app.get("io"); 

            if (!currentUser.matched) {
                currentUser.save();

                User.find({}, function(err, allUsers) {
                    allUsers.forEach((u) => {
                        const _id = u._id.toString()
                        if (currentUser.followings.findIndex(f => f._id.toString() === _id) >= 0) {
                            io.to(_id).emit("greet", {
                                type: "ADD",
                                user: currentUser.getData(),
                            })
                        }
                        else if (current_id !== _id) {
                            io.to(_id).emit("approach", {
                                type: "ADD",
                                user: currentUser.getData(),
                                matched: "unmatched",
                            })
                        }
                    });
                });
                return res.status(200).json({
                    message: "Already finished",
                })
            }
            const matched_id = currentUser.matched.toString();
            
            // delete my match
            currentUser.matched = undefined;
            currentUser.save();

            res.status(200).json({
                success: true,
            })

            // send left person the message
            User.findById(matched_id).then(matchedUser => {
                User.find({}, function(err, allUsers) {
                    allUsers.forEach((u) => {
                        const _id = u._id.toString()
                        if (_id === current_id) {
                            io.to(_id).emit("approach", {
                                type: "ADD",
                                user: matchedUser.getData(),
                                following: "unfollowing",
                                matched: "unmatched",
                            })
                        }
                        else if (_id === matched_id) {
                            io.to(_id).emit("approach", {
                                type: "ADD",
                                user: currentUser.getData(),
                                following: "unfollowing",
                            })
                        }
                        else if (currentUser.followings.findIndex(f => f._id.toString() === _id) >= 0) {
                            io.to(_id).emit("greet", {
                                type: "ADD",
                                user: currentUser.getData(),
                            })
                        }
                        else {
                            io.to(_id).emit("approach", {
                                type: "UNMATCHED",
                                _id: current_id,
                            })
                        }
                    });
                });

                if (matchedUser.matched) {
                    io.to(matched_id).emit("finishCall");
                }
            });

            const log = new Log({
                kind: "FINISHED",
                content: matched_id,
                user: current_id
            })

            log.save((err, doc) => {
                if (err) console.error(err)
            })

        });
    } catch (err) { console.error(err) }


});

router.get("/proceed", (req, res) => {
    try {
        const current_id = req.cookies.w_id;

        User.findById(new ObjectId(current_id)).then(currentUser => {
            if (!currentUser.matched) return;

            const io = req.app.get("io"); 
            io.to(currentUser.matched.toString()).emit("createCall");
        })

        const log = new Log({
            kind: "PROCEEDED",
            user: current_id
        })

        log.save((err, doc) => {
            if (err) console.error(err)
        })
    } catch (err) {console.error(err)}
})

router.get("/cancel", (req, res) => {
    const current_id = req.cookies.w_id;

    try {

        User.findById(new ObjectId(current_id)).then(currentUser => {

            if (!currentUser.matched) {
                return res.status(200).json({
                    message: "Already canceled",
                })
            } 

            const matched_id = currentUser.matched.toString();

            // send cancellee the message
            const io = req.app.get("io"); 
            io.to(matched_id).emit("cancelled");

            // delete match
            currentUser.matched = undefined;
            currentUser.save();

            res.status(200).json({
                success: true,
            })

            // create log
            const log = new Log({
                kind: "CANCELLED",
                content: matched_id,
                user: current_id
            })

            log.save((err, doc) => {
                if (err) console.error(err)
            })

            // show canceller to others
            User.findById(matched_id).then(matchedUser => {
                User.find({}, function(err, allUsers) {
                    allUsers.forEach((u, i) => {
                        const _id = u._id.toString()
                        if (_id === current_id) {
                            io.to(_id).emit("approach", {
                                type: "ADD",
                                user: matchedUser.getData(),
                                following: "unfollowing",
                                matched: "unmatched",
                            })
                        }
                        else if (_id === matched_id) {
                            io.to(_id).emit("approach", {
                                type: "ADD",
                                user: currentUser.getData(),
                                following: "unfollowing",
                            })
                        }
                        else if (currentUser.followings.findIndex(f => f._id.toString() === _id) >= 0) {
                            io.to(_id).emit("greet", {
                                type: "ADD",
                                user: currentUser.getData(),
                            })
                        }
                        else {
                            io.to(_id).emit("approach", {
                                type: "UNMATCHED",
                                _id: current_id,
                            })
                        }
                    });
                });
            });
            
        })
    } catch (err) {console.error(err)}
});

router.get("/cancel_confirm", (req, res) => {
    const current_id = req.cookies.w_id;

    try {

        User.findById(new ObjectId(current_id)).then(currentUser => {
            if (!currentUser.matched) {
                return res.status(200).json({
                    message: "Already canceled",
                })
            }

            // delete match
            currentUser.matched = undefined;
            currentUser.save();

            res.status(200).json({
                success: true,
            })

            const io = req.app.get("io"); 
            User.find({}, function(err, allUsers) {
                allUsers.forEach((u, i) => {
                    const _id = u._id.toString();
                    if (currentUser.followings.findIndex(f => f._id.toString() === _id) >= 0) {
                        io.to(_id).emit("greet", {
                            type: "ADD",
                            user: currentUser.getData(),
                        })
                    }
                    else if (_id !== current_id) {
                        io.to(_id).emit("approach", {
                            type: "UNMATCHED",
                            _id: current_id,
                        })
                    }
                });
            })
        });

    } catch (err) { console.error(err) }

});


module.exports = router;