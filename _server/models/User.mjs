// /server/models/User.mjs
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address.'], // email validation regex
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
  },
  biography: {
    type: String,
  },
  favorite_number: {
    type: Number,
  },
  profile_img: {
    type: Buffer,  // Store the profile image as binary data
  },
});

const User = mongoose.model('User', userSchema);
export default User;
