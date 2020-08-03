const express = require("express");
const router = express.Router();

const { checkPassword } = require("../middleware/user/checkPassword");
const { loginSNS } = require("../middleware/user/loginSNS");
const { signup } = require("../middleware/user/signup");
const { login } = require("../middleware/user/login");
const { getCurrentUser } = require("../middleware/getCurrentUser");
const { getCurrentGroup } = require("../middleware/getCurrentGroup");

const { log } = require("../libs/log");
const { remove } = require("../libs/socket");

router.post("/signup", signup, (req, res) => {
    const user = res.locals.user;

    user.save((err, doc) => {
        // create log
        console.log("* SIGNUP: created", user.id, new Date().toISOString());
        log("SIGNUP", user._id.toString());
    });
});

router.post("/login", checkPassword, login, (req, res) => {
    const user = res.locals.user;
    
    // initialize followers & followings
    user.initialize();

    user.save((err, doc) => {
        // create log
        log("LOGIN", user._id.toString());
        return;
    });
})

router.post("/login_sns", loginSNS, (req, res) => {
    const user = res.locals.user;
    
    user.save((err, doc) => {
        // create log
        log("LOGIN", user._id.toString());
        return;
    })
})

router.get("/logout", getCurrentUser, getCurrentGroup, (req, res) => {
    const user = res.locals.user;
    
    res.status(200)
    .cookie("w_auth", "")
    .json({
        success: true
    });

    const io = req.app.get("io"); 
    const groupIO = io.of(`/group${user.available.toString()}`);
    groupIO.emit("greet", remove(user.id));
    groupIO.emit("approach", remove(user.id));

    user.deactivate();
    user.initialize();
    
    user.save((err, doc) => {
        log("LOGOUT", doc._id.toString());
    });
})

module.exports = router;