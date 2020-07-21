const express = require("express");
const router = express.Router();

const { checkPassword } = require("../middleware/user/checkPassword");
const { checkSNS } = require("../middleware/user/checkSNS");
const { signup } = require("../middleware/user/signup");
const { login } = require("../middleware/user/login");
const { getCurrentUser } = require("../middleware/getCurrentUser");

const log = require("../libs/log");
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

router.post("/login_sns", checkSNS, (req, res) => {
    const user = res.locals.user;
    
    user.save((err, doc) => {
        // create log
        log("LOGIN", user._id.toString());
        return;
    })
})

router.get("/logout", getCurrentUser, (req, res) => {
    const user = res.locals.user;
    
    res.status(200)
    .cookie("w_auth", "")
    .json({
        success: true
    });

    user.deactivate();
    user.initialize();
    
    user.save((err, doc) => {
        const io = req.app.get("io"); 
        io.emit("greet", remove(doc.id));
        io.emit("approach", remove(doc.id));

        log("LOGOUT", doc._id.toString());
    });
})

module.exports = router;