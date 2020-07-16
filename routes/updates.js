const express = require("express");

const { User } = require("../schemas/User");
const { Log } = require("../schemas/Log");

const router = express.Router();

const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'profiles',
    allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
    filename: function (req, file, cb) {
        cb(undefined, 'profile' + (new Date()).getTime())
    }
    // transformation: [{ width: 500, height: 500, crop: 'limit' }]
});

const parser = multer({ storage: storage });

router.post("/update_image", parser.single("image"), function (req, res) {
    const current_id = req.cookies.w_id;

    try {
        if (!current_id || current_id === undefined || current_id.length === 0 || current_id === "undefined") return;
        User.findById(current_id).then(user => {
            user.image = req.file.url;
            console.log(user);
            user.save((err, doc) => {
                res.status(200).json({
                    success: true,
                    image: req.file.url,
                });

                const io = req.app.get("io"); 
                User.find({}, function(err, allUsers) {
                    if (err) console.error(err);

                    allUsers.forEach((u) => {
                        const _id = u._id.toString();
                        if (_id !== current_id) {
                            const data = {
                                type: "UPDATE_IMAGE",
                                _id: current_id,
                                image: req.file.url,
                            }
                            if (user.followings.findIndex(f => f._id.toString() === _id) >= 0) {
                                io.to(_id).emit("greet", data)
                            }
                            else {
                                io.to(_id).emit("approach", data)
                            }
                        }
                    })
                });
            })
        });
        return;
    } catch (err) {console.error(err)}
});

router.post("/update", (req, res) => {
    const current_id = req.cookies.w_id;

    try {
        if (!current_id || current_id === undefined || current_id.length === 0 || current_id === "undefined") return;
        User.findById(current_id).then(user => {
            if (!user) {
                return res.status(200).json({
                    success: false,
                })
            }
            user.firstname = req.body.firstname;
            user.lastname = req.body.lastname;
            user.affiliation = req.body.affiliation;
            user.keywords = req.body.keywords;
            user.save();
            res.status(200).json({
                success: true,
            });

            const io = req.app.get("io"); 
            User.find({}, function(err, allUsers) {
                if (err) console.error(err);

                allUsers.forEach((u) => {
                    const _id = u._id.toString();
                    if (_id !== current_id) {
                        const data = {
                            type: "UPDATE",
                            _id: current_id,
                            firstname: user.firstname,
                            lastname: user.lastname,
                            affiliation: user.affiliation,
                            keywords: user.keywords,
                        }
                        if (user.followings.findIndex(f => f._id.toString() === _id) >= 0) {
                            io.to(_id).emit("greet", data)
                        }
                        else {
                            io.to(_id).emit("approach", data)
                        }
                    }
                })
            });
        })
    } catch (err) {console.error(err)}
});

router.get("/unavailable", (req, res) => {
    try {
        const current_id = req.cookies.w_id;
        if (!current_id || current_id === undefined || current_id.length === 0 || current_id === "undefined") return;
        User.findById(current_id).then(currentUser => {
            currentUser.available = false;
            currentUser.save((err, doc) => {
                if (err) console.error(err);

                const io = req.app.get("io");
                User.find({}, function(err, allUsers) {
                    allUsers.forEach((u) => {
                        const _id = u._id.toString();
                        if (_id !== current_id) {
                            if (currentUser.followings.findIndex(f => f._id.toString() === _id) >= 0) {
                                io.to(_id).emit("greet", {
                                    type: "REMOVE",
                                    user_id: currentUser.id,
                                })
                            }
                            else {
                                io.to(_id).emit("approach", {
                                    type: "REMOVE",
                                    user_id: currentUser.id,
                                })
                            }
                        }
                    });
                });
            });
        })
        
    } catch (err) {console.error(err)}
});

module.exports = router;