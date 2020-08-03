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
          user: { 
              type: Schema.ObjectId, 
              ref: 'User' 
          },
      }

  ],
  activeMembers: [
    {
        user: { 
            type: Schema.ObjectId, 
            ref: 'User' 
        },
    }
  ],
}, {timestamps: true})

// get basic data of the current user
groupSchema.methods.getData = function() {
  let group = this;

  return {
    _id: group._id,
    name: group.name,
  };
}

const Group = mongoose.model('Group', groupSchema);
module.exports = { Group }