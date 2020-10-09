const { User } = require('../../schemas/User');
//TODO : le
const loginAfterEmailValidation = (req, res, next) => {

    User.findOne({validationHash: req.body.validationHash}).then(user => {
        if (!user) {
            return res.json({ message: "E-mail hash does not exist." });
        }

        user.update({
            validationHash: "",
            hasValidatedEmail: true
        }).then(()=>{
            res.locals.user = user;
            next();
        });

    });

};

module.exports = { loginAfterEmailValidation };
