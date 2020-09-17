// models/User.js
const mongoose = require("mongoose");

const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")
const saltRounds = 10 // step 0

const { deactivate } = require("../libs/deactivate");

const { Schema } = mongoose;

const userSchema = new Schema({
  id: {
    type: Number,
    unique: 1,
    required: true,
  },
  firstname: {
    type: String,
    maxlength: 50
  },
  lastname: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true, // delete space
    unique: 1
  },
  password: {
    type: String,
    minlength: 5
  },
  affiliation: String,
  keywords: String,
  image: String,
  roomIndex: {
    type: Number,
    default: 0
  },
  token: String,
  followings: [
    {
      user: { 
        type: Schema.ObjectId, 
        ref: 'User' 
      },
    }
  ],
  followers: [
    {
      user: { 
        type: Schema.ObjectId, 
        ref: 'User' 
      },
    }
  ],
  matched: {
    type: Schema.ObjectId, 
    ref: 'User' 
  },
  calling: {
    type: Boolean,
    default: false,
  },
  available: {
    type: Schema.ObjectId,
    ref: 'Group'
  },
  createdGroups: [
    {
      group: {
        type: Schema.ObjectId,
        ref: 'Group'
      }
    }
  ],
  joinedGroups: [
    {
      group: {
        type: Schema.ObjectId,
        ref: 'Group'
      }
    }
  ],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {timestamps: true})

// crypt password before save
userSchema.pre("save", function(next) {
  let user = this;
  
  bcrypt.genSalt(saltRounds, function(err, salt) {
    if (err)
      return next(err)
    
    if (user.isModified('password')) {
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err)
          return next(err)
        user.password = hash
        next()
      });
    }
    else {
      next()
    }
    
  })
});

// compare password when logging in
userSchema.methods.comparePassword = function(plainPassword, next) {
  bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
    if (err)
      return next(err);
      next(null, isMatch); // should be true
  })
}

userSchema.methods.isIn = function(group_id) {
  const isJoined = this.joinedGroups.findIndex(g => g._id.toString() === group_id.toString()) >= 0;
  const isCreated = this.createdGroups.findIndex(g => g._id.toString() === group_id.toString()) >= 0;

  return isJoined || isCreated;
}

// check if the current user is following a certain user
userSchema.methods.isFollowing = function(_id) {
  return this.followings.findIndex(f => f._id.toString() === _id.toString()) >= 0
}

// check if the current user is followed by a certain user
userSchema.methods.isFollowedBy = function(_id) {
  return this.followers.findIndex(f => f._id.toString() === _id.toString()) >= 0
}

// get basic data of the current user
userSchema.methods.getData = function() {
  let user = this;

  let isMatched = (user.matched) ? true : false;

  return {
    _id: user._id,
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    affiliation: user.affiliation,
    keywords: user.keywords,
    image: user.image,
    matched: isMatched,
  };
}

// get full name of the current user
userSchema.methods.getName = function() {
  return this.firstname + " " + this.lastname;
}

userSchema.methods.activate = function(type) {
  let secret = process.env.FACEBOOK
  if (type === "GOOGLE")
      secret = process.env.GOOGLE

  const token = this._id.toHexString()
  this.token = token;

  return jwt.sign(token, secret);
}

userSchema.methods.deactivate = function() {
  deactivate(this.available, this._id);
  this.available = undefined;
  this.token = "";
}

userSchema.methods.initialize = function() {
  let user = this;

  // initialize matched & calling status
  user.matched = undefined;
  user.calling = false;

  // initialize followers & followings
  user.followers.forEach((follower) => {
      User.updateOne({_id: follower}, {
          $pull: { followings: {_id: user._id} }
      }, {safe: true}, function(err, obj) {
          if (err) console.error(err);
      });
  });

  user.followings.forEach((following) => {
      User.updateOne({_id: following}, {
          $pull: { followers: {_id: user._id} }
      }, {safe: true}, function(err, obj) {
          if (err) console.error(err);
      });
  });

  user.followers = [];
  user.followings = [];
}

const User = mongoose.model('User', userSchema);
module.exports = { User }