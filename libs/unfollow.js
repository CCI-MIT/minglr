const { User } = require("../schemas/User");

module.exports = function (follower_id, following_id) { 
    User.updateOne({_id: following_id}, {
        $pull: { 
            followers: {
                _id: follower_id
            }
        }
    }, {safe: true}, function(err, obj) {
        if (err) console.error(err);
    });

    User.updateOne({_id: follower_id}, {
        $pull: { 
            followings: {
                _id: following_id
            }
        }
    }, {safe: true}, function(err, obj) {
        if (err) console.error(err);
    });
};