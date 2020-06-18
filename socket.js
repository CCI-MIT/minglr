// socket.js
const SocketIO = require("socket.io");
const cookie = require('cookie');
const ObjectId = require('mongodb').ObjectID;

const { User } = require("./schemas/User");
const { Log } = require("./schemas/Log");

module.exports = (server, app) => {
    const io = SocketIO(server, {path: "/socket.io"});

    let isConnected = false;

    // 라우터에서 io 객체를 쓸 수 있게 저장
    app.set("io", io);
    // join, leave는 방에 들어가고 나가는 메서드
    io.on("connection", (socket) => {

        if (socket.handshake.headers.cookie) {
            const current_id = cookie.parse(socket.handshake.headers.cookie).w_id
            try {
                let currentUser = undefined;

                if (!current_id || current_id === undefined || current_id.length === 0 || current_id === "undefined") return;

                socket.join(current_id);

                User.findById(current_id).then(user => {
                    currentUser = user;

                    if (currentUser && currentUser.token && currentUser.token.length > 0) {
                        console.log("SOCKET CONNECTED", current_id)

                        user.available = true;
                        user.save((err, doc) => {
                            User.find({}, function(err, allUsers) {
                                allUsers.forEach((u, i) => {
                                    const _id = u._id.toString()
                                    if (_id !== current_id) {

                                        if (currentUser.followings.findIndex(f => f._id.toString() === _id) >= 0) {
                                            io.to(_id).emit("greet", {
                                                type: "ADD",
                                                user: currentUser.getData(),
                                            })
                                        }
                                        else if (currentUser.followers.findIndex(f => f._id.toString() === _id) >= 0) {
                                            io.to(_id).emit("approach", {
                                                type: "ADD",
                                                user: currentUser.getData(),
                                                following: "following",
                                            })
                                        }
                                        else {
                                            io.to(_id).emit("approach", {
                                                type: "ADD",
                                                user: currentUser.getData(),
                                                following: "unfollowing",
                                            })
                                        }
                                    }
                                });
                            });
                            // io.emit("greet", {
                            //     type: "REFRESH",
                            //     key: currentUser.id
                            // });

                            // io.emit("approach", {
                            //     type: "REFRESH",
                            //     key: currentUser.id
                            // });
                            isConnected = true;
                        });
                            
                    }
                });
            } catch (err) {console.error(err);}

            socket.on("match", (data) => {
                try {
                    User.findOne({id: data.receiver}).then(receiver => {
                        // if already matched return
                        if (receiver.matched) {
                            io.to(current_id).emit("matchFail");
                            return;
                        }
                        else {

                            User.findById(current_id).then(currentUser => {
                                if (currentUser.matched) {
                                    io.to(current_id).emit("matchFail");
                                    return;
                                }
                            
                                // update the matched field of receiver
                                receiver.matched = currentUser._id;
                                receiver.save();

                                // update the matched field of clicker
                                currentUser.matched = receiver._id;

                                // send message to two clients
                                let roomName = current_id + currentUser.roomIndex;
                                currentUser.roomIndex = currentUser.roomIndex + 1;
                                currentUser.save();

                                io.to(current_id).emit("waitCall", {
                                    room: roomName,
                                    name: receiver.getName(),
                                });
                                io.to(receiver._id).emit("joinCall", {
                                    room: roomName,
                                    name: currentUser.getName(),
                                });

                                // remove them from the other's client
                                User.find({}, function(err, allUsers) {
                                    allUsers.forEach((u, i) => {
                                        const _id = u._id.toString();

                                        if (_id === current_id || receiver.followings.findIndex(f => f._id.toString() === _id) >= 0) {
                                            io.to(_id).emit("greet", {
                                                type: "REMOVE",
                                                user_id: receiver.id,
                                            })
                                        }
                                        else {
                                            io.to(_id).emit("approach", {
                                                type: "MATCHED",
                                                _id: receiver._id,
                                            })
                                        }

                                        if (_id === receiver._id || currentUser.followings.findIndex(f => f._id.toString() === _id) >= 0) {
                                            io.to(_id).emit("greet", {
                                                type: "REMOVE",
                                                user_id: currentUser.id,
                                            })
                                        }
                                        else {
                                            io.to(_id).emit("approach", {
                                                type: "MATCHED",
                                                _id: currentUser._id,
                                            })
                                        }
                                    });
                                })

                                // delete follow relationship
                                User.updateOne({_id: currentUser._id}, {
                                    $pull: { followers: {_id: receiver._id} }
                                }, {safe: true}, function(err, obj) {
                                    if (err) console.error(err);
                                });
            
                                User.updateOne({_id: receiver._id}, {
                                    $pull: { followings: {_id: currentUser._id} }
                                }, {safe: true}, function(err, obj) {
                                    if (err) console.error(err);
                                });

                                // log
                                console.log("* MATCHED: ", receiver.id, "with", currentUser.id, new Date().toISOString());
                                const log = new Log({
                                    kind: "MATCHED",
                                    content: receiver._id.toString(),
                                    user: currentUser._id.toString()
                                });

                                log.save((err, doc) => {
                                    if (err) console.error(err)
                                });
                            });
                        }

                    })
                } catch (err) {console.error(err);}
            })

            socket.on("disconnect", () => {
                // console.log(socket);
                const current_id = cookie.parse(socket.handshake.headers.cookie).w_id;
                console.log("SOCKET DISCONNECTED", current_id)

                isConnected = false;

                try {
                    User.findById(current_id).then(currentUser => {
                        currentUser = currentUser;
                        if (currentUser && currentUser.token && currentUser.token.length > 0) {
                            
                            setTimeout(function() {
                                if (!isConnected) {
                                io.to(current_id).emit("clientDisconnect")
                                console.log("remove", currentUser.firstname)
                                    User.find({}, function(err, allUsers) {
                                        allUsers.forEach((u, i) => {
                                            const _id = u._id.toString()
                                            if (_id !== current_id) {
                                                if (currentUser.followings.findIndex(f => f._id.toString() === _id) >= 0) {
                                                    io.to(_id).emit("greet", {
                                                        type: "REMOVE",
                                                        user_id: currentUser.id,
                                                    })
                                                }
                                                else {
                                                    io.to(_id).emit("approach", {
                                                        type: "REMOVE",
                                                        user_id: currentUser.id,
                                                    })
                                                }
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