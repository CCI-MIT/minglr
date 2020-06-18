const express = require("express");
const jwt = require('jsonwebtoken');

const { User } = require("../schemas/User");
const { Log } = require("../schemas/Log");

const router = express.Router();

router.get("/auth", (req, res) => {
    try {
        const token = req.cookies.w_auth;
        const type = req.cookies.w_authtype;
        let secret = process.env.FACEBOOK;
        if (type === "GOOGLE") {
            secret = process.env.GOOGLE
        }
        if (!token) {
            return res.json({
                isAuth: false,
                message: "no user found",
            })
        }
        jwt.verify(token, secret, function(err, decoded) {
            User.findOne({ token: decoded }, function(err, user) {
                if (err) {throw err}
                else if (!user) {
                    return res.json({
                        isAuth: false,
                        message: "no user found",
                    })
                }
                else {
                    if (user.calling) {
                        const io = req.app.get("io"); 
                        io.to(user._id).emit("finishCall");
                    }
                    if (user.matched) {
                        console.log(user);
                        User.findById(user.matched).then(matchedUser => {
                            if (!matchedUser.matched) {
                                const io = req.app.get("io");
                                io.to(user._id).emit("finishCall");
                            }
                        })
                    }
                    return res.status(200).json({
                        isAuth: true,
                        email: user.email,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        affiliation: user.affiliation,
                        keywords: user.keywords,
                        image: user.image,
                        id: user.id,
                        _id: user._id,
                    });
                }
            })
        });
    } catch (err) {console.error(err)}
})

router.post("/signup", (req, res) => {
    try {
        User.findOne({ email: req.body.email }, (err, currentUser) => {
            if (currentUser) {
                if (currentUser.password) {
                    return res.json({
                        success: false,
                        message: "You have already signed up with this email."
                    });
                }
                else {
                    currentUser.available = true;
                    currentUser.calling = false;
                    currentUser.password = req.body.password;

                    const token = currentUser._id.toHexString()
                    const cookieToken = jwt.sign(token, process.env.FACEBOOK);
                    currentUser.token = token;
                    
                    currentUser.save((err, doc) => {
                        if (err) {
                            console.error(err);
                            return res.json({success: false, err})
                        }

                        // initialize the user
                        if (currentUser.calling) {
                            const io = req.app.get("io"); 
                            io.to(currentUser._id).emit("finishCall");
                        }
                        else if (currentUser.matched) {
                            User.findById(currentUser.matched).then(matchedUser => {
                                if (!matchedUser.matched) {
                                    const io = req.app.get("io");
                                    io.to(currentUser._id).emit("finishCall");
                                }
                            })
                        }

                        res.cookie("w_auth", cookieToken, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true })
                        .status(200)
                        .json({
                            success: true,
                            type: "LOGIN",
                            _id: currentUser._id.toString(),
                        });

                    })
                    return;
                }
            }
            else {

                // Signup
                let index = 0
                User.findOne().sort({$natural: -1}).limit(1).exec(function(err, last){
                    index = last.id + 1;
                    const user = new User({
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                        // image: req.body.image,
                        password: req.body.password,
                        id: index,
                        available: true,
                    });

                    user.save((err, doc) => {
                        if (err) {
                            console.error(err);
                            return res.json({success: false, err});
                        }

                        const token = user._id.toHexString()
                        const cookieToken = jwt.sign(token, process.env.FACEBOOK);
                        user.token = token;
                        user.save();

                        console.log("* SIGNUP: created", user.id, new Date().toISOString());
                        res.cookie("w_auth", cookieToken, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true })
                        .status(200)
                        .json({
                            success: true,
                            type: "SIGNUP",
                            _id: user._id.toString(),
                        })
                    });

                    // create log
                    const log = new Log({
                        kind: "SIGNUP",
                        user: user._id.toString(),
                    })

                    log.save((err, doc) => {
                        if (err) console.error(err)
                    })
                    return;
                });
            }
        })
    } catch (err) {console.error(err)}
});

router.post("/login", (req, res) => {
    try {
        User.findOne({email: req.body.email}, (err, user) => {
            if (err) console.error(err);

            if (!user) {
                return res.json({success: false, message: "The user does not exist"});
            }

            user.comparePassword(req.body.password, (err, isMatch) => {
                if (!isMatch) {
                    return res.json({success: false, message: "Wrong password"})
                }

                user.available = true;

                const token = user._id.toHexString()
                const cookieToken = jwt.sign(token, process.env.FACEBOOK);
                user.token = token;

                res.cookie("w_auth", cookieToken, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true })
                .status(200)
                .json({
                    success: true,
                    type: "LOGIN",
                    _id: user._id.toString(),
                });;

                // initialize followers & followings
                user.followers.forEach((follower) => {
                    User.updateOne({_id: follower}, {
                        $pull: { followings: {_id: user._id} }
                    }, {safe: true}, function(err, obj) {
                        if (err) console.error(err);
                    });
                });
    
                user.followings.forEach((following) => {
                    User.updateOne({_id: following}, {
                        $pull: { followers: {_id: user._id} }
                    }, {safe: true}, function(err, obj) {
                        if (err) console.error(err);
                    });
                });
    
                user.followers = [];
                user.followings = [];

                user.save();

                // initialize calling
                if (user.calling) {
                    const io = req.app.get("io"); 
                    io.to(user._id).emit("finishCall");
                }
                // initialize match
                if (user.matched) {
                    User.findById(user.matched).then(matchedUser => {
                        if (!matchedUser.matched) {
                            const io = req.app.get("io");
                            io.to(user._id).emit("finishCall");
                        }
                    })
                }

                // create log
                const log = new Log({
                    kind: "LOGIN",
                    user: user._id.toString(),
                })

                log.save((err, doc) => {
                    if (err) console.error(err)
                });
                return;
            });

        })
    } catch (err) {console.error(err)}
})

router.post("/login_sns", (req, res) => {
    try {
        const type = req.body.type;
        let secret = process.env.FACEBOOK
        if (type === "GOOGLE")
            secret = process.env.GOOGLE
            
        const cookieToken = jwt.sign(req.body.token, secret)
        User.findOne({ email: req.body.email }, (err, user) => {
            if (!user) {
                // Signup
                let index = 1
                User.findOne().sort({$natural: -1}).limit(1).exec(function(err, last){
                    if (last)
                        index = last.id + 1;

                    const user = new User({
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                        image: req.body.image,
                        token: req.body.token,
                        id: index,
                        available: true,
                    });
                    user.save((err, doc) => {
                        if (err) {
                            console.error(err);
                            return res.json({success: false, err});
                        }

                        console.log("* SIGNUP: created", user.id, new Date().toISOString());
                        res.cookie("w_auth", cookieToken, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true })
                        .status(200)
                        .json({
                            success: true,
                            type: "SIGNUP",
                            _id: user._id.toString(),
                        })
                    });

                    // create log
                    const log = new Log({
                        kind: "SIGNUP",
                        user: user._id.toString(),
                    })
    
                    log.save((err, doc) => {
                        if (err) console.error(err)
                    })
                    return;
                });
            }
            else {
                // Login
                user.available = true;
                user.token = req.body.token;

                res.cookie("w_auth", cookieToken, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true })
                .status(200)
                .json({
                    success: true,
                    type: "LOGIN",
                    _id: user._id.toString(),
                });

                // initialize followers & followings
                user.followers.forEach((follower) => {
                    User.updateOne({_id: follower}, {
                        $pull: { followings: {_id: user._id} }
                    }, {safe: true}, function(err, obj) {
                        if (err) console.error(err);
                    });
                });
    
                user.followings.forEach((following) => {
                    User.updateOne({_id: following}, {
                        $pull: { followers: {_id: user._id} }
                    }, {safe: true}, function(err, obj) {
                        if (err) console.error(err);
                    });
                });
    
                user.followers = [];
                user.followings = [];

                user.save();

                // initialize calling
                if (user.calling) {
                    const io = req.app.get("io"); 
                    io.to(user._id).emit("finishCall");
                }
                // initialize match
                if (user.matched) {
                    User.findById(user.matched).then(matchedUser => {
                        if (!matchedUser.matched) {
                            const io = req.app.get("io");
                            io.to(user._id).emit("finishCall");
                        }
                    })
                }

                // create log
                const log = new Log({
                    kind: "LOGIN",
                    user: user._id.toString(),
                })

                log.save((err, doc) => {
                    if (err) console.error(err)
                });
                return;
            }
        });
    } catch (err) {console.error(err);}
})

router.get("/logout", (req, res) => {
    const current_id = req.cookies.w_id;

    try {
        if (!current_id || current_id === undefined || current_id.length === 0 || current_id === "undefined") return;

        User.findById(current_id).then(user => {
            if (!user) return res.json({success: false});

            res.status(200)
            .cookie("w_auth", "")
            .json({
                success: true
            });

            user.token = "";
            user.available = false;
            user.matched = undefined;

            user.followers.forEach((follower) => {
                User.updateOne({_id: follower}, {
                    $pull: { followings: {_id: user._id} }
                }, {safe: true}, function(err, obj) {
                    if (err) console.error(err);
                });
            });

            user.followings.forEach((following) => {
                User.updateOne({_id: following}, {
                    $pull: { followers: {_id: user._id} }
                }, {safe: true}, function(err, obj) {
                    if (err) console.error(err);
                });
            });

            user.followers = [];
            user.followings = [];
            
            user.save((err, doc) => {
                const io = req.app.get("io"); 
                io.emit("greet", {
                    type: "REMOVE",
                    user_id: doc.id,
                })
                io.emit("approach", {
                    type: "REMOVE",
                    user_id: doc.id,
                });
            });

        });
    } catch (err) {console.error(err)}
})

module.exports = router;