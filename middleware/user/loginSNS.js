const { User } = require('../../schemas/User');

const { createUser } = require("./createUser");
const { login } = require("./login");

let loginSNS = (req, res, next) => {
    try {
        User.findOne({ email: req.body.email }, (err, user) => {
            if (!user) {
                return createUser(req, res, next);
            }
            else {
                res.locals.user = user;
                return login(req, res, next);
            }
        });
    } catch (err) {console.error(err);}
}

module.exports = { loginSNS };