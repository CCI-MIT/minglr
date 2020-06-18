// models/User.js
const mongoose = require("mongoose");

const bcrypt = require("bcrypt")
const saltRounds = 10 // step 0

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
  available: {
    type: Boolean,
    default: false,
    required: true,
  },
  calling: {
    type: Boolean,
    default: false,
  },
  matched: {
    type: Schema.ObjectId, 
    ref: 'User' 
  },
  followings: [
      {
          user:{ 
              type: Schema.ObjectId, 
              ref: 'User' 
          },
      }

  ],
  followers: [
      {
          user:{ 
              type: Schema.ObjectId, 
              ref: 'User' 
          },
      }
  ],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {timestamps: true})

// crypt password before save
userSchema.pre("save", function(next) {
  var user = this;
  
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

userSchema.methods.comparePassword = function(plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
    if (err)
      return cb(err);
    cb(null, isMatch); // true일 것
  })
}

userSchema.methods.getData = function() {
  var user = this;

  var isMatched = (user.matched) ? true : false;

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


userSchema.methods.getName = function() {
  return this.firstname + " " + this.lastname;
}


const User = mongoose.model('User', userSchema);
module.exports = { User }