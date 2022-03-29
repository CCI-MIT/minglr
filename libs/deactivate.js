const { Group } = require("../schemas/Group");

const deactivate = (group_id, user_id) => { 
    Group.updateOne({_id: group_id}, {
        $pull: { 
            activeMembers: {
                _id: user_id
            }
        }
    }, {safe: true}, function(err, obj) {
        if (err) console.error(err);
    });
};

module.exports = { deactivate };