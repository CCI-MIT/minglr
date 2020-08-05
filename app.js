const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();
/*
* special settings
*/
// websocket
const webSocket = require("./socket");

// mongoDB connection
const mongoose = require("mongoose");
const {MONGO_ID, MONGO_PASSWORD, MONGO_APPNAME, NODE_ENV} = process.env;
const MONGO_URL = `mongodb+srv://${MONGO_ID}:${MONGO_PASSWORD}@${MONGO_APPNAME}.mongodb.net/<dbname>?retryWrites=true&w=majority`;
const connect = mongoose.connect(MONGO_URL, {
    useNewUrlParser: true, useUnifiedTopology: true,
    useCreateIndex: true, useFindAndModify: false
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.error(err));
// const connect = require("./schemas");
// connect();

/*
* use
*/

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors())
app.use(cookieParser());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// routing
const indexRouter = require("./routes");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const groupsRouter = require("./routes/groups");
const matchRouter = require("./routes/match");
const updatesRouter = require("./routes/updates");
const resetPasswordRouter = require("./routes/reset_password");
app.use('/api', indexRouter)
app.use('/api', authRouter)
app.use('/api', usersRouter)
app.use('/api', groupsRouter)
app.use('/api', matchRouter)
app.use('/api', updatesRouter)
app.use('/api', resetPasswordRouter)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});


/*
* run server and connect with webSocket
*/
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});
webSocket(server, app);