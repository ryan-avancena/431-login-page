import User from '../models/User.mjs';

export const updateUser = async (req, res) => {
  const userId = req.session.userId;
  console.log(userId)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const updateFields = req.body;

  try {
    const updated = await User.findByIdAndUpdate(userId, updateFields, { new: true });
    // console.log("Updated user:", updated);
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile.' });
  }
};
