const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // If you want to ensure user is logged in
const QuizResult = require('../models/quizResult');

// POST /api/quiz/submit
// Saves the user's quiz answers in MongoDB
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // from JWT, set by authMiddleware
    const { answers } = req.body;

    const newQuiz = new QuizResult({
      user: userId,
      answers: answers,
    });

    await newQuiz.save();
    res.json({ message: 'Quiz saved successfully!' });
  } catch (err) {
    console.error('Quiz submit error:', err);
    res.status(500).json({ message: 'Failed to store quiz', error: err });
  }
});

module.exports = router;
