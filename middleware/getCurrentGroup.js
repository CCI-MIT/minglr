const { Group } = require('../schemas/Group');

let getCurrentGroup = (req, res, next) => {
    const user = res.locals.user;

    if (!user.available) {
        return res.json({
            success: false,
            message: "Not authorized to a group",
        });
    }
    else {
        Group.findById(user.available).then(group => {
            if (!group) {
                return res.json({
                    success: false,
                    message: "The group does not exist",
                }); 
            }
            res.locals.group = group;
            next();
        })
    }
}

module.exports = { getCurrentGroup };