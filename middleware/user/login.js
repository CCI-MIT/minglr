const { finishCall } = require("./finishCall");

let login = (req, res, next) => {
    const user = res.locals.user;

    const token = user.activate(req.body.type);
    res.cookie("w_auth", token, { httpOnly: true })
    .status(200)
    .json({
        success: true,
        type: "LOGIN",
        _id: user._id.toString(),
    });

    return finishCall(req, res, next);
};

module.exports = { login };
