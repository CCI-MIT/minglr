const { User } = require("../schemas/User");

const { add, remove, markAsMatched, unmarkAsMatched } = require("./socket");

module.exports = {

    addNewUser: (currentUser, io) => {
        User.find({}, function(err, allUsers) {
            allUsers.forEach((u) => {
                const _id = u._id.toString()
                if (_id !== currentUser._id.toString()) {
                    if (currentUser.isFollowing(_id)) {
                        io.to(_id).emit( "greet", add(currentUser.getData()) );
                    }
                    else if (currentUser.isFollowedBy(_id)) {
                        io.to(_id).emit( "approach", add(currentUser.getData(), "following") );
                    }
                    else {
                        io.to(_id).emit( "approach", add(currentUser.getData(), "unfollowing") );
                    }
                }
            });
        });
    },

    removeMatchedUsers: (currentUser, receiver, io) => {
        // remove or mark these two from the other's client
        User.find({}, function(err, allUsers) {
            allUsers.forEach((u, i) => {
                const _id = u._id.toString();

                // remove receiver from greet 
                if (_id === currentUser._id.toString() || receiver.isFollowing(_id)) {
                    io.to(_id).emit( "greet", remove(receiver.id) );
                }
                // mark receiver as talking
                else {
                    io.to(_id).emit( "approach", markAsMatched(receiver._id) );
                }

                // remove receiver from greet 
                if (_id === receiver._id || currentUser.isFollowing(_id)) {
                    io.to(_id).emit( "greet", remove(currentUser.id) );
                }
                // mark currentUser as talking
                else {
                    io.to(_id).emit( "approach", markAsMatched(currentUser._id) );
                }
            });
        })
    },

    putBackUser: function(currentUser, io) {
        const current_id = currentUser._id.toString();

        User.find({}, function(err, allUsers) {
            allUsers.forEach((u, i) => {
                const _id = u._id.toString();
                if (currentUser.isFollowing(_id)) {
                    io.to(_id).emit("greet", add(currentUser.getData()));
                }
                else if (_id !== current_id) {
                    io.to(_id).emit("approach", unmarkAsMatched(current_id));
                }
            });
        })

    },
    
    putBackMatchedUser: function(currentUser, matched_id, io) {
        const current_id = currentUser._id.toString();
        
        User.findById(matched_id).then(matchedUser => {
            User.find({}, function(err, allUsers) {
                allUsers.forEach((u) => {
                    const _id = u._id.toString()
                    // current user: unfollow and unmatch with the matched user
                    if (_id === current_id) {
                        io.to(_id).emit("approach", {
                            type: "ADD",
                            user: matchedUser.getData(),
                            following: "unfollowing",
                            matched: "unmatched",
                        })
                    }
                    // matched user: unfollow and unmatch with the current user
                    else if (_id === matched_id) {
                        io.to(_id).emit("approach", {
                            type: "ADD",
                            user: currentUser.getData(),
                            following: "unfollowing",
                            matched: "unmatched",
                        })
                    }
                    // the users who the current user is following
                    else if (currentUser.isFollowing(_id)) {
                        io.to(_id).emit("greet", add(currentUser.getData()));
                    }
                    // the other users
                    else {
                        io.to(_id).emit("approach", unmarkAsMatched(current_id));
                    }
                });
            });
        });
    }
}