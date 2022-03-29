// socket.js
const SocketIO = require("socket.io");
const cookie = require('cookie');

const { User } = require("./schemas/User");

module.exports = (server, app) => {

    // save io object so that it can be used in routers
    const io = SocketIO(server);
    app.set("io", io);            

    io.on("connection", (socket) => {
        if (socket.handshake.headers.cookie) {
            const current_id = cookie.parse(socket.handshake.headers.cookie).w_id
            try {
                if (!current_id || current_id === undefined || current_id.length === 0 || current_id === "undefined") return;

                socket.join(current_id);

                // connect the current user
                User.findById(current_id).then(currentUser => {
                    if (currentUser && currentUser.token && currentUser.token.length > 0) {
                        console.log("SOCKET CONNECTED", current_id);
                        isConnected = true;

                        // currentUser.available = true;
                        // currentUser.save((err, doc) => {
                        //     addNewUser(currentUser, io);
                        //     isConnected = true;
                        // });
                    }
                });
            } catch (err) {console.error(err);}
        }
    })
}