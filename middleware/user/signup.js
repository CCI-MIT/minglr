const { User } = require('../../schemas/User');

const { login } = require("./login");
const { createUser } = require("./createUser");

let signup = (req, res, next) => {
    try {
        User.findOne({ email: req.body.email }, (err, currentUser) => {
            if (currentUser) {
                // CASE1. already signed up via email
                if (currentUser.password) {
                    return res.json({
                        success: false,
                        message: "You have already signed up with this email."
                    });
                }
                // CASE2. already signed up via sns
                else {
                    // add password
                    currentUser.password = req.body.password;
                    return login(req, res, next);
                }
            }
            // CASE3. newly signing up
            else {
                return createUser(req, res, next);
            }
        })
    } catch (err) {console.error(err)}
};

module.exports = { signup };
