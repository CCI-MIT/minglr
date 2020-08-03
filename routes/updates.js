const express = require("express");

const { getCurrentUser } = require("../middleware/getCurrentUser");
const { getCurrentGroup } = require("../middleware/getCurrentGroup");
const { remove } = require("../libs/socket");
const { deactivate } = require("../libs/deactivate");

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

router.post("/update_image", parser.single("image"), getCurrentUser, getCurrentGroup, function (req, res) {
    const user = res.locals.user;
    const group = res.locals.group;
    const current_id = user._id.toString();

    user.image = req.file.url;
    console.log(user);
    user.save((err, doc) => {
        res.status(200).json({
            success: true,
            image: req.file.url,
        });

        const io = req.app.get("io"); 
        const groupIO = io.of(`/group${user.available.toString()}`);
            
        const data = {
            type: "UPDATE_IMAGE",
            _id: current_id,
            image: req.file.url,
        }

        group.activeMembers.forEach((u) => {
            const _id = u._id.toString();
            if (_id !== current_id) {
                if (user.isFollowing(_id)) {
                    groupIO.to(_id).emit("greet", data)
                }
                else {
                    groupIO.to(_id).emit("approach", data)
                }
            }
        })
    });
});

router.post("/update", getCurrentUser, getCurrentGroup, (req, res) => {
    const user = res.locals.user;
    const group = res.locals.group;
    const current_id = user._id.toString();

    user.firstname = req.body.firstname;
    user.lastname = req.body.lastname;
    user.affiliation = req.body.affiliation;
    user.keywords = req.body.keywords;
    user.save();
    res.status(200).json({
        success: true,
    });

    const io = req.app.get("io"); 
    const groupIO = io.of(`/group${user.available.toString()}`);

    const data = {
        type: "UPDATE",
        _id: current_id,
        firstname: user.firstname,
        lastname: user.lastname,
        affiliation: user.affiliation,
        keywords: user.keywords,
    }

    group.activeMembers.forEach((u) => {
        const _id = u._id.toString();
        if (_id !== current_id) {
            if (user.followings.findIndex(f => f._id.toString() === _id) >= 0) {
                groupIO.to(_id).emit("greet", data)
            }
            else {
                groupIO.to(_id).emit("approach", data)
            }
        }
    })
});

router.get("/unavailable", getCurrentUser, getCurrentGroup, (req, res) => {
    const currentUser = res.locals.user;
    const current_id = currentUser._id.toString();
    const group = res.locals.group;

    const io = req.app.get("io"); 
    const groupIO = io.of(`/group${currentUser.available.toString()}`);

    group.activeMembers.forEach((u) => {
        const _id = u._id.toString();
        if (_id !== current_id) {
            if (currentUser.isFollowing(_id)) {
                groupIO.to(_id).emit("greet", remove(currentUser.id));
            }
            else {
                groupIO.to(_id).emit("approach", remove(currentUser.id));
            }
        }
    });

    deactivate(group._id, current_id);
    currentUser.available = undefined;
    currentUser.initialize();
    currentUser.save((err, doc) => {
        if (err) console.error(err);
    })
});

module.exports = router;