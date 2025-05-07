import User from '../models/User.mjs';

export const updateUser = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const updateFields = req.body;

  try {
    await User.findByIdAndUpdate(userId, updateFields);
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile.' });
  }
};
