const { User } = require('../schemas/User');
const jwt = require('jsonwebtoken');

let auth = (req, res, next) => {
  let token = req.cookies.w_auth;

  jwt.verify(token, process.env.CODE, function(err, decode){
    User.findOne({ token: decode }, function(err, user){
      if (err) throw err;
      else if (!user)
        return res.json({
          isAuth: false,
          error: true
        });

      next();
    })
  })

};

module.exports = { auth };
