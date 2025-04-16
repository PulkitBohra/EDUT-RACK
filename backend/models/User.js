const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"], // Ensure valid roles
    required: true,
  },
  courses: {
    type: [String],
    default: [],
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;