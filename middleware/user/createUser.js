const { User } = require('../../schemas/User');

let signup = (req, res, next) => {
    // calculate index
    let index = 0
    User.findOne().sort({$natural: -1}).limit(1).exec(function(err, last){
        index = last.id + 1;
        const user = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password,
            id: index,
            available: true,
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
                
};

module.exports = { signup };
