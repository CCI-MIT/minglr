const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const { User } = require("../schemas/User");

const router = express.Router();

router.post("/forgot_password", (req, res) => {
    User.findOne({email: req.body.email}).then(user => {
        if (!user) {
            return res.json({ message: "Email does not exist."});
        }

        const token = crypto.randomBytes(20).toString("hex");
        user.update({
            resetPasswordToken: token,
            resetPasswordExpires: Date.now() + 360000,
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${process.env.EMAIL_ADDRESS}`,
                pass: `${process.env.EMAIL_PASSWORD}`,
            },
        });

        const mailOptions = {
            from: `${process.env.EMAIL_ADDRESS}`,
            to: `${user.email}`,
            subject: '[Minglr] Link To Reset Password',
            text:
              'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n'
              + 'Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n'
              + `https://${process.env.DOMAIN}/resetpassword/${token}\n\n`
              + 'If you did not request this, please ignore this email and your password will remain unchanged.\n',
        };

        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error(err);
                return res.json({message: "Something went wrong."})
            } 
            else {
                return res.status(200).json({success: true});
            }
        });
    });
});

router.get("/verify_token", (req, res) => {
    User.findOne({
        where: {
            resetPasswordToken: req.query.resetPasswordToken,
            resetPasswordExpires: {$gt: Date.now(),}
        }
    }).then(user => {
        if (!user) {
            return res.json({
                message: "The link is invalid or has expired.",
            });
        }

        return res.status(200).json({
            success: true,
            email: user.email,
        })
    })

})
router.post("/reset_password", (req, res) => {
    User.findOne({email: req.body.email}).then(user => {
        if (!user) {
            return res.json({success: false})
        }

        user.password = req.body.password;
        user.save((err, doc) => {

            if (err) {
                console.error(err);
                return res.json({success: false});
            }
            return res.json({
                success: true,
            })
        });

        
    })
})

module.exports = router;