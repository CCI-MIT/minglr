const { finishCall } = require("./finishCall");

let login = (req, res, next) => {
    const user = res.locals.user;

    const defaultGroup = (process.env.MINGLR_DEFAULT_PUBLIC_GROUP)?(process.env.MINGLR_DEFAULT_PUBLIC_GROUP):(false);
    const token = user.activate(req.body.type);
    res.cookie("w_auth", token, { httpOnly: true })
    .status(200)
    .json({
        success: true,
        type: "LOGIN",
        defaultGroup: defaultGroup,
        _id: user._id.toString(),
    });

    return finishCall(req, res, next);
};

module.exports = { login };
