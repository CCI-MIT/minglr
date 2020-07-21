const jwt = require('jsonwebtoken');

const { User } = require('../../schemas/User');

let auth = (req, res, next) => {
  try {
    // get cookies
    const token = req.cookies.w_auth;
    const type = req.cookies.w_authtype;
    if (!token) {
        return res.json({
            isAuth: false,
            message: "no token found",
        })
    }

    // set secret
    let secret = process.env.FACEBOOK;
    if (type === "GOOGLE") {
        secret = process.env.GOOGLE
    }

    // verify token
    jwt.verify(token, secret, function(err, decoded) {
        User.findOne({ token: decoded }, function(err, user) {
            if (err) {throw err}
            else if (!user) {
              return res.json({
                  isAuth: false,
                  message: "no user found",
              })
            }
            else {
              res.locals.user = user;
              next();
            }
        })
    });
  } catch (err) {console.error(err)}
};

module.exports = { auth };
