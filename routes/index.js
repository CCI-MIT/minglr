const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const { checkPassword } = require("../middleware/user/checkPassword");
const { loginSNS } = require("../middleware/user/loginSNS");
const { signup } = require("../middleware/user/signup");
const { login } = require("../middleware/user/login");
const { getCurrentUser } = require("../middleware/getCurrentUser");
const { getCurrentGroup } = require("../middleware/getCurrentGroup");

const { log } = require("../libs/log");
const { remove } = require("../libs/socket");
const nodemailer = require("nodemailer");
const nodemailerSendgrid = require('nodemailer-sendgrid');

const EmailConfiguration = require("../utils/email");
const LinkedinUtils = require("../utils/linkedin");

router.post("/signup", signup, (req, res) => {
    const user = res.locals.user;
    user.validationHash = crypto.randomBytes(20).toString("hex");
    user.hasValidatedEmail = false;
    user.shouldCreateGroups = false;

    user.save((err, doc) => {
        if (err) {console.error(err)}
        // create log
        console.log("* SIGNUP: created", user.id, new Date().toISOString());
        log("SIGNUP", user._id.toString());
        // send email
        sendSignUpEmail(user);
    });
});
function sendSignUpEmail(user){

    let transporter = nodemailer.createTransport(EmailConfiguration.getEmailSenderConfiguration());

    const mailOptions = {
        from: `${process.env.EMAIL_ADDRESS}`,
        to: `${user.email}`,
        subject: '[Minglr] Link To Validate Email',
        text:
            'You are receiving this because you (or someone else) have registered your email to a Minglr account.\n\n'
            + 'Please click on the following link, or paste this into your browser to validate your email:\n\n'
            + `https://${process.env.DOMAIN}/validateregistration/${user.validationHash}\n\n`
            + 'If you did not request this, please ignore this email .\n',
    };

    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
            console.error(err);
        }
        return;
    });
}

router.post("/login", checkPassword, login, (req, res) => {
    const user = res.locals.user;
    
    // initialize followers & followings
    user.initialize();

    user.save((err, doc) => {
        if (err) {console.error(err)}
        // create log
        log("LOGIN", user._id.toString());
        return;
    });
})

router.post("/login_sns", loginSNS, (req, res) => {
    const user = res.locals.user;
    
    user.save((err, doc) => {
        if (err) {console.error(err)}
        // create log
        log("LOGIN", user._id.toString());
        return;
    })
})

router.get("/getLinkedinData", (req, res) =>{
    LinkedinUtils.getValidatedWithLinkedinUser(req.query.code)
        .then((dataBack) => res.json(dataBack))

});

router.get("/logout", getCurrentUser, (req, res) => {
    const user = res.locals.user;
    
    res.status(200)
    .cookie("w_auth", "")
    .json({
        success: true
    });

    if (user.available) {
        const io = req.app.get("io"); 
        const groupIO = io.of(`/group${user.available.toString()}`);
        groupIO.emit("greet", remove(user.id));
        groupIO.emit("approach", remove(user.id));
    }

    user.deactivate();
    user.initialize();
    
    user.save((err, doc) => {
        if (err) {console.error(err)}
        log("LOGOUT", doc._id.toString());
    });
})

module.exports = router;