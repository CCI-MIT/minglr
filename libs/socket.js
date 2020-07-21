module.exports = {
    add: function(data, following = "") {
        if (following == "following" || following == "unfollowing")
            return {
                type: "ADD",
                user: data,
                following: following,
            }
        else 
            return {
                type: "ADD",
                user: data
            }
    },
    remove: function(id) {
        return {
            type: "REMOVE",
            user_id: id,
        }
    },
    markAsMatched: function(_id) {
        return {
            type: "MATCHED",
            _id: _id.toString(),
        }
    }
};