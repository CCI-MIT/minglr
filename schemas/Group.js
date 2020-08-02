// models/Group.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const groupSchema = new Schema({
  name: String,
  creator: {
    type: Schema.ObjectId, 
    ref: 'User' 
  },
  members: [
      {
          user:{ 
              type: Schema.ObjectId, 
              ref: 'User' 
          },
      }

  ]
}, {timestamps: true})

const Group = mongoose.model('Group', groupSchema);
module.exports = { Group }