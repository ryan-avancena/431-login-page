export const logoutUser = (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: 'Logout failed.' });
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully.' });
    });
  };
  