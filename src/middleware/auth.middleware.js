const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.FLASH_KISS_JWT_SECRET);

    // Fetch user from database
    const user = await User.findById(decoded.user.id);

    if (!user) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
