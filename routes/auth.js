const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/user/auth");
const { finishCall } = require("../middleware/user/finishCall");

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

module.exports = router;