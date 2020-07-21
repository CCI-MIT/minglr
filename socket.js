// socket.js
const SocketIO = require("socket.io");
const cookie = require('cookie');

const { User } = require("./schemas/User");

const { unfollow } = require("./libs/unfollow");
const { log } = require("./libs/log");
const { add, remove, markAsMatched } = require("./libs/socket");

module.exports = (server, app) => {
    const io = SocketIO(server, {path: "/socket.io"});

    // save io object so that it can be used in routers
    app.set("io", io);

    let isConnected = false;

    const addNewUser = (currentUser) => {
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
    }

    const setMatchedInformation = (currentUser, receiver) => {
        // update the matched field of receiver
        receiver.matched = currentUser._id;
        receiver.save();

        // update the matched field of clicker
        currentUser.matched = receiver._id;

        // calculate the room name
        let roomName = currentUser._id.toString() + currentUser.roomIndex;
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

    const removeMatchedUsers = (currentUser, receiver) => {
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
                            addNewUser(currentUser);
                            isConnected = true;
                        });
                    }
                });
            } catch (err) {console.error(err);}

            socket.on("match", (data) => {
                try {
                    User.findOne({id: data.receiver}).then(receiver => {
                        // if already matched, return
                        if (receiver.matched) {
                            io.to(current_id).emit("matchFail");
                            return;
                        }
                        else {
                            // if already matched, return
                            User.findById(current_id).then(currentUser => {
                                if (currentUser.matched) {
                                    io.to(current_id).emit("matchFail");
                                    return;
                                }
                            
                                // set matched, roomIndex, roomName, and show call to two people
                                setMatchedInformation(currentUser, receiver)

                                // remove or mark these two from the other's client
                                removeMatchedUsers(currentUser, receiver);
                                
                                // delete follow relationship
                                unfollow(receiver._id, currentUser._id);

                                // log
                                console.log("* MATCHED: ", receiver.id, "with", currentUser.id, new Date().toISOString());
                                log("MATCHED", current_id, receiver._id.toString());
                            });
                        }

                    })
                } catch (err) {console.error(err);}
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