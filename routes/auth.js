const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/user/auth");
const { finishCall } = require("../middleware/user/finishCall");

const {loginAfterEmailValidation} = require("../middleware/user/loginAfterEmailValidation")
const {login} = require("../middleware/user/login")

const { User } = require("../schemas/User");

router.get("/auth", auth, finishCall, (req, res) => {
    const user = res.locals.user;

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
})

router.post("/validate_registration",loginAfterEmailValidation, login, (req, res) =>{

    const user = res.locals.user;
    // initialize followers & followings
    user.initialize();

    user.save((err, doc) => {

    });

})

module.exports = router;