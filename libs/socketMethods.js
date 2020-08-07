const { Group } = require("../schemas/Group");
const { User } = require("../schemas/User");

const { add, remove, markAsMatched, unmarkAsMatched } = require("./socket");

module.exports = {

    addNewUser: (activeMembers, currentUser, io) => {
        const current_id = currentUser._id.toString();
        activeMembers.forEach((u) => {
            const _id = u._id.toString()
            if (_id !== current_id) {
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
    },

    removeMatchedUsers: (currentUser, receiver, io) => {
        const current_id = currentUser._id.toString();
        const receiver_id = receiver._id.toString();

        Group.findById(currentUser.available).then(group => {
            // remove or mark these two from the other's client
            group.activeMembers.forEach((u, i) => {
                const _id = u._id.toString();

                // remove receiver from greet 
                if (_id === current_id || receiver.isFollowing(_id)) {
                    io.to(_id).emit( "greet", remove(receiver.id) );
                }
                // mark receiver as talking
                else if (_id !== receiver_id) {
                    io.to(_id).emit( "approach", markAsMatched(receiver._id) );
                }

                // remove currentUser from greet 
                if (_id === receiver_id || currentUser.isFollowing(_id)) {
                    io.to(_id).emit( "greet", remove(currentUser.id) );
                }
                // mark currentUser as talking
                else if (_id !== current_id) {
                    io.to(_id).emit( "approach", markAsMatched(currentUser._id) );
                }
            });
        })
    },

    putBackUser: function(activeMembers, currentUser, io) {
        const current_id = currentUser._id.toString();

        activeMembers.forEach(u => {
            const _id = u._id.toString();
            if (currentUser.isFollowing(_id)) {
                io.to(_id).emit("greet", add(currentUser.getData()));
            }
            else if (_id !== current_id) {
                io.to(_id).emit("approach", unmarkAsMatched(current_id));
            }
        });

    },
    
    putBackMatchedUser: function(activeMembers, currentUser, matched_id, io) {
        const current_id = currentUser._id.toString();

        User.findById(matched_id).then(matchedUser => {
            activeMembers.forEach(u => {
                const _id = u._id.toString();
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
    }

           
}