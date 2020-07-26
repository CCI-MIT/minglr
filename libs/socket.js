module.exports = {
    add: function(data, msg = "") {
        if (msg == "following" || msg == "unfollowing")
            return {
                type: "ADD",
                user: data,
                following: msg,
            }
        else if (msg == "matched" || msg == "unmatched") {
            return {
                type: "ADD",
                user: data,
                matched: msg,
            }
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
    },
    unmarkAsMatched: function(_id) {
        return {
            type: "UNMATCHED",
            _id: _id.toString(),
        }
    }
};