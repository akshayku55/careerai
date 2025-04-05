// routes/roadmap.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Notice we're using "/generate" here:
router.post('/generate', authMiddleware, async (req, res) => {
  const { career } = req.body;

  if (!career) {
    return res.status(400).json({ message: 'Career is required' });
  }

  try {
    const prompt = `
You are an AI career roadmap expert. Generate a detailed step-by-step roadmap for becoming a ${career}, from beginner to advanced. 
Include:
- Key topics to learn
- Courses (free & paid)
- Books
- Certifications
- Projects
- Internships/job tips

Respond in Markdown format with bullet points and headings.
    `;

    const chatResp = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a professional career roadmap generator.' },
        { role: 'user', content: prompt }
      ]
    });

    const roadmapMarkdown = chatResp.choices[0].message.content;
    // Return as { roadmap: "...markdown..." }
    res.json({ roadmap: roadmapMarkdown });

  } catch (err) {
    console.error('❌ Roadmap Generation Error:', err);
    res.status(500).json({ message: 'Failed to generate roadmap' });
  }
});

module.exports = router;
