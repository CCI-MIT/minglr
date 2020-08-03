const { User } = require('../../schemas/User');

const { createUser } = require("./createUser");
const { login } = require("./login");

let loginSNS = (req, res, next) => {
    try {
        User.findOne({ email: req.body.email }, (err, user) => {
            if (!user) {
                let index = 0
                User.findOne().sort({$natural: -1}).limit(1).exec(function(err, last){
                    index = last.id + 1;
                    const user = new User({
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                        id: index,
                    });

                    const token = user.activate(req.body.type);
                    res.cookie("w_auth", token, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true })
                        .status(200)
                        .json({
                            success: true,
                            type: "SIGNUP",
                            _id: user._id.toString(),
                        });
                    
                    res.locals.user = user;
                    next();
                });
            }
            else {
                res.locals.user = user;
                return login(req, res, next);
            }
        });
    } catch (err) {console.error(err);}
}

module.exports = { loginSNS };