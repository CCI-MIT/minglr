// models/User.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const logSchema = new Schema({
  kind: {
    type: String,
    maxlength: 50
  },
  content: String,
  user: String,
}, {timestamps: true})


const Log = mongoose.model('Log', logSchema);
module.exports = { Log }