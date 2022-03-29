const { User } = require('../../schemas/User');

let finishCall = (req, res, next) => {
    const user = res.locals.user;

    const io = req.app.get("io"); 

    if (user.available) {
        const groupIO = io.of(`/group${user.available.toString()}`);

        // initialize
        if (user.calling) {
            
            groupIO.to(user._id).emit("finishCall");
        }
        if (user.matched) {
            console.log(user);
            User.findById(user.matched).then(matchedUser => {
                if (!matchedUser.matched) {
                    groupIO.to(user._id).emit("finishCall");
                }
            })
        }
    }
    next();
};

module.exports = { finishCall };
