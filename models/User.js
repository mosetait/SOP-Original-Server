const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create the User schema
const userSchema = new Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  role:{
    type: String,
    required: true,
    enum: ["stockist" , "admin"],
    default: "stockist"
  },

  state:{
    type: String,
    required: true
  },

  address:{
    type: String,
    required: true
  },

} , {timestamps: true});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
