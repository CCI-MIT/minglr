// socket.js
const SocketIO = require("socket.io");
const cookie = require('cookie');

const { User } = require("./schemas/User");

const { unfollow } = require("./libs/unfollow");
const { log } = require("./libs/log");
const { addNewUser, removeMatchedUsers } = require("./libs/socketMethods");
const { add, remove, markAsMatched } = require("./libs/socket");

module.exports = (server, app) => {
    const io = SocketIO(server, {path: "/socket.io"});

    // save io object so that it can be used in routers
    app.set("io", io);

    let isConnected = false;

    const setMatchedInformation = (currentUser, receiver) => {
        // update the matched field of receiver
        receiver.matched = currentUser._id;
        receiver.save();

        // update the matched field of clicker
        currentUser.matched = receiver._id;

        // calculate the room name
        let current_id = currentUser._id.toString();
        let roomName = current_id + currentUser.roomIndex;
        currentUser.roomIndex = currentUser.roomIndex + 1;
        currentUser.save();

        // send message to two clients
        io.to(current_id).emit("waitCall", {
            room: roomName,
            name: receiver.getName(),
        });
        io.to(receiver._id).emit("joinCall", {
            room: roomName,
            name: currentUser.getName(),
        });
    }


    io.on("connection", (socket) => {

        if (socket.handshake.headers.cookie) {
            const current_id = cookie.parse(socket.handshake.headers.cookie).w_id
            try {
                if (!current_id || current_id === undefined || current_id.length === 0 || current_id === "undefined") return;

                socket.join(current_id);

                // connect the current user
                User.findById(current_id).then(currentUser => {
                    if (currentUser && currentUser.token && currentUser.token.length > 0) {
                        console.log("SOCKET CONNECTED", current_id)

                        currentUser.available = true;
                        currentUser.save((err, doc) => {
                            addNewUser(currentUser, io);
                            isConnected = true;
                        });
                    }
                });
            } catch (err) {console.error(err);}

            socket.on("match", (data, next) => {
                try {
                    User.findOne({id: data.receiver}).then(receiver => {
                        // if already matched, return
                        if (receiver.matched) {
                            return next({
                                success: false,
                                message: "Sorry, this user is already matched to someone else.",
                            })
                        }
                        else {
                            // if already matched, return
                            User.findById(current_id).then(currentUser => {
                                if (currentUser.matched) {
                                    return next({
                                        success: false,
                                        message: "Sorry, you already clicked on this user.",
                                    })
                                }
                            
                                // set matched, roomIndex, roomName, and show call to two people
                                setMatchedInformation(currentUser, receiver)

                                // remove or mark these two from the other's client
                                removeMatchedUsers(currentUser, receiver, io);
                                
                                // delete follow relationship
                                unfollow(receiver._id, currentUser._id);

                                // log
                                console.log("* MATCHED: ", receiver.id, "with", currentUser.id, new Date().toISOString());
                                log("MATCHED", current_id, receiver._id.toString());
                            });
                        }

                    })
                } catch (err) {console.error(err);}
            });

            socket.on("follow", (data, next) => {
                try {
                    User.findById(current_id).then(currentUser => {
                        User.findOne({id: data.user_id}).then(user => {
            
                            // check if the requested user is already in follower list of other user then 
                            if (user.isFollowedBy(current_id)) {
                                return next({
                                    success: false,
                                    message: "You are already waiting for the user"
                                })
                            }
                            else if (user.isFollowing(current_id)) {
                                return next({
                                    success: false,
                                    message: "This user is currently waiting for you. Please look at the right panel."
                                })
                            }
                            // check if the requested user and :user_id is same if same then 
                            else if (current_id === data.user_id) {
                                return next({ 
                                    success: false,
                                    message: "You cannot follow yourself"
                                })
                            }
            
                            // create follow relationships
                            user.followers.unshift(currentUser._id);
                            user.save()
            
                            currentUser.followings.unshift(user._id);
                            currentUser.save();
            
                            next({
                                success: true,
                                currentUser: currentUser.getData(),
                            })
            
                            // update the other user's list
                            io.to(user._id.toString()).emit("approach", remove(currentUser.id));
                            io.to(user._id.toString()).emit("greet", add(currentUser.getData()));
            
                            // log
                            console.log("* FOLLOW: following", user.id, "by", current_id, new Date().toISOString());
                            log("FOLLOW", current_id, user._id);
                        })
                    })
                } catch (err) {console.error(err)}
            });

            socket.on("unfollow", (data, next) => {
                try {
                    User.findOne({id: data.user_id}).then(user => {
            
                        // check if your id doesn't match the id of the user you want to unfollow
                        if (user._id.toString() === current_id) {
                            return next({ success: false, message: 'You cannot unfollow yourself' });
                        }
                        else {
            
                            // first update the list of the other user
                            User.findById(current_id).then(currentUser => {
                                io.to(user._id.toString()).emit("greet", remove(currentUser.id));
            
                                io.to(user._id.toString()).emit("approach", add(currentUser.getData(), "unfollowing"));
                            })
            
                            // remove the id of the user you want to unfollow from following array
                            unfollow(current_id, user._id);
                            
                            next({ success: true });
            
                            // log
                            console.log("* UNFOLLOW: unfollowing", user.id, "by", current_id, new Date().toISOString());
                            log("UNFOLLOW", current_id, user._id);
                        }
                        
                    });
                } catch (err) {
                    return res.status(400).json({ success: false, error: err.message })
                }
            })

            socket.on("disconnect", () => {
                // console.log(socket);
                const current_id = cookie.parse(socket.handshake.headers.cookie).w_id;
                console.log("SOCKET DISCONNECTED", current_id);

                isConnected = false;

                try {
                    User.findById(current_id).then(currentUser => {
                        currentUser = currentUser;
                        if (currentUser && currentUser.token && currentUser.token.length > 0) {
                            
                            setTimeout(function() {
                                if (!isConnected) {
                                    io.to(current_id).emit("clientDisconnect")

                                    User.find({}, function(err, allUsers) {
                                        allUsers.forEach((u, i) => {
                                            const _id = u._id.toString()
                                            if (_id !== current_id) {
                                                io.to(_id).emit( "greet", remove(currentUser.id) );
                                                io.to(_id).emit( "approach", remove(currentUser.id) );
                                            }
                                        });
                                    });

                                    currentUser.available = false;
                                    currentUser.save();
                                }
                            }, 5000)
                            
                        }
                    })
                } catch (err) {console.error(err)}
                
            })
        }
    })
}