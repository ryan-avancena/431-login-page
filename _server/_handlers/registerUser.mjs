// /server/_handlers/registerUser.mjs
import User from '../models/User.mjs';
import bcrypt from 'bcryptjs';
import multer from 'multer';

// Configure multer in-memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Wrap your handler in a function that calls multer manually
export const registerUser = (req, res) => {
  upload.single('profile_img')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: 'Error uploading file.' });
    }

    // Destructure AFTER multer processes form-data
    const { username, password, email, first_name, last_name, birthday, biography, favorite_number } = req.body;

    if (!username || !password || !email || !first_name || !last_name) {
      return res.status(400).json({ message: 'All required fields must be filled out.' });
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        password: hashedPassword,
        email,
        first_name,
        last_name,
        birthday: birthday ? new Date(birthday) : undefined,
        biography,
        favorite_number: favorite_number ? parseInt(favorite_number) : undefined,
        profile_img: req.file ? req.file.buffer : undefined,
      });

      await newUser.save();

      res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  });
};
