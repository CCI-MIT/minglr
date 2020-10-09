const { User } = require('../../schemas/User');

let checkPassword = (req, res, next) => {
    try {
        User.findOne({email: req.body.email}, (err, user) => {
            if (err) console.error(err);

            if (!user) {
                return res.json({success: false, message: "The user does not exist"});
            }

            user.comparePassword(req.body.password, (err, isMatch) => {
                if (!isMatch) {
                    return res.json({success: false, message: "Wrong password"})
                }
                else {
                    if(user.validationHash!="" && !user.hasValidatedEmail){
                        return res.json({success: false, message: "E-mail has not been validated"})
                    }
                    res.locals.user = user;
                    next();
                }
            });
        });
    } catch (err) {console.error(err)};
};

module.exports = { checkPassword };
