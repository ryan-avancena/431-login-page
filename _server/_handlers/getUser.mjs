import User from '../models/User.mjs';

export const getUser = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const user = await User.findById(userId).select('-password -profile_img');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user data.' });
  }
};


export const getUserCollection = async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
  
    try {
      const user = await User.findById(userId).select('-password -profile_img');
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: 'Error retrieving user data.' });
    }
  };
  