const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/user');

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ name: user.name, career: user.career });
  } catch (error) {
    console.error('GET /me error:', error);
    res.status(500).json({ message: 'Failed to fetch user.' });
  }
});

// Update career route (unchanged)
router.post('/update-career', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { selectedCareer } = req.body;
    if (!selectedCareer) {
      return res.status(400).json({ message: "Career path required." });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { career: selectedCareer },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ message: "Career updated successfully", career: user.career });
  } catch (err) {
    console.error("Update career error:", err);
    res.status(500).json({ message: "Failed to update career.", error: err.message });
  }
});

module.exports = router;
