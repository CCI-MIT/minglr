const { User } = require('../schemas/User');

let getCurrentUser = (req, res, next) => {
    const current_id = req.cookies.w_id;

    try {
        if (!current_id || current_id === undefined || current_id.length === 0 || current_id === "undefined") 
            return res.json({
                success: false,
                message: "Not logged in",
            });

        User.findById(current_id).then(user => {
            if (!user) 
                return res.json({
                    success: false,
                    message: "No user found",
                });
            else {
                res.locals.user = user;
                next();        
            }
        });

    } catch (err) {console.error(err)}
}

module.exports = { getCurrentUser };