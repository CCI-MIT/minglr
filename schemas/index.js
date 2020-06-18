// 몽고디비와 연결하는 코드
const mongoose = require("mongoose");

const {MONGO_ID, MONGO_PASSWORD, NODE_ENV} = process.env;
const MONGO_URL = `mongodb+srv://${MONGO_ID}:${MONGO_PASSWORD}@minglr-gbvll.mongodb.net/test?retryWrites=true&w=majority`;

module.exports = () => {

    const connect = () => {
        if (NODE_ENV !== 'production')
            mongoose.set("debug", true);
        
        mongoose.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        .catch (error => {
            if (error)
                console.log("몽고디비 연결 에러", error)
            else
                console.log("몽고디비 연결 성공")
        });
    }

    connect();

    mongoose.connection.on("error", (error) => {
        console.log("몽고디비 연결 에러", error);
    })
    mongoose.connection.on("disconnected", () => {
        console.log("몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.");
        connect();
    })

    // require("./user");
};