import multer from 'multer';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import User from '../models/User.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const imagesPath = resolve(__dirname, '..', '..', 'client', 'images');
if (!fs.existsSync(imagesPath)) {
  fs.mkdirSync(imagesPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: imagesPath,
  filename: (req, file, cb) => {
    // Use a temporary filename during the upload phase
    const timestamp = Date.now();
    const ext = file.originalname.split('.').pop();
    cb(null, `temp_${timestamp}.${ext}`);
  },
});

const upload = multer({ storage });

export const updateUser = (req, res) => {
  upload.single('profile_img')(req, res, async (err) => {
    if (err) {
      console.error('Multer error during update:', err);
      return res.status(400).json({ message: 'Error uploading file.' });
    }

    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const updateFields = { ...req.body };

    console.log(updateFields)

    if (updateFields.birthday) {
      updateFields.birthday = new Date(updateFields.birthday);
    }
    if (updateFields.favorite_number) {
      updateFields.favorite_number = parseInt(updateFields.favorite_number);
    }


    // Ensure the username is available after multer handles the upload
    if (req.file) {
      const ext = req.file.originalname.split('.').pop();
      const safeUsername = req.body.username?.replace(/[^\w\-]/g, '_') || 'user'; // default to 'user' if username is not set
      const newFilename = `${safeUsername}.${ext}`;
      const newPath = join(imagesPath, newFilename);

      // Rename the file after it is uploaded
      try {
        fs.renameSync(req.file.path, newPath);
        updateFields.profile_img = `/images/${newFilename}`;
      } catch (renameErr) {
        console.error('Failed to rename uploaded file:', renameErr);
        return res.status(500).json({ message: 'File upload rename failed.' });
      }
    }

    try {
      await User.findByIdAndUpdate(userId, updateFields, { new: true });
      res.json({ message: 'Profile updated successfully.' });
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ message: 'Error updating profile.' });
    }
  });
};
