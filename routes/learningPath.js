const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/user');

// GET /api/user/learning-path - Retrieve learning path tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ tasks: user.learningPath || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch learning path tasks' });
  }
});

// POST /api/user/learning-path - Save/update learning path tasks
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Invalid tasks format' });
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { learningPath: tasks },
      { new: true }
    );
    res.json({ tasks: user.learningPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save learning path tasks' });
  }
});

// DELETE /api/user/learning-path/:index - Delete a specific task by index
router.delete('/:index', authMiddleware, async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const user = await User.findById(req.userId);
    if (!user || !user.learningPath || index < 0 || index >= user.learningPath.length) {
      return res.status(400).json({ message: 'Invalid index' });
    }
    user.learningPath.splice(index, 1);
    await user.save();
    res.json({ tasks: user.learningPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

module.exports = router;
