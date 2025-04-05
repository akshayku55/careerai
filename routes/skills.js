// routes/skills.js
const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.get("/", async (req, res) => {
  const career = req.query.career;
  if (!career) return res.status(400).json({ error: "Career is required" });

  const prompt = `
Suggest 5 essential skills for a career in ${career}. 
Return them as a JSON array in this format:

[
  {
    "name": "Skill Name",
    "description": "Brief description"
  },
  ...
]
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices[0].message.content.trim();
    const skills = JSON.parse(raw); // GPT returns valid JSON
    res.json(skills);
  } catch (err) {
    console.error("❌ Error in /api/skills:", err.message);
    res.status(500).json({ error: "Failed to fetch skills." });
  }
});

module.exports = router;
