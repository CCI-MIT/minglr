const { User } = require('../../schemas/User');

let finishCall = (req, res, next) => {
    const user = res.locals.user;

    // initialize
    if (user.calling) {
        const io = req.app.get("io"); 
        io.to(user._id).emit("finishCall");
    }
    if (user.matched) {
        console.log(user);
        User.findById(user.matched).then(matchedUser => {
            if (!matchedUser.matched) {
                const io = req.app.get("io");
                io.to(user._id).emit("finishCall");
            }
        })
    }

    next();
};

module.exports = { finishCall };
