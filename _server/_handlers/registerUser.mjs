import multer from 'multer';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from '../models/User.mjs';  // Your model import
import bcrypt from 'bcryptjs';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure the 'client/images' folder exists, create it if not
const imagesPath = resolve(__dirname, '..', '..', 'client', 'images');  // Use resolve to get the absolute path from the root
if (!fs.existsSync(imagesPath)) {
  fs.mkdirSync(imagesPath, { recursive: true });
}


// Set up multer storage
const storage = multer.diskStorage({
  destination: imagesPath,  // Use the path that we've ensured exists
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}.${ext}`);
  },
});


const upload = multer({ storage });

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
        profile_img: req.file ? `/images/${req.file.filename}` : undefined,  // ✅ Add this line
      });

      await newUser.save();

      res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  });
};
