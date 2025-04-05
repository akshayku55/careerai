const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Authorization token is missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Assuming the JWT contains the userId
    next();
  } catch (err) {
    console.error('Authorization error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
