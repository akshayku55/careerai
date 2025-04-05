require('dotenv').config(); // Load environment variables at the very start

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OpenAI } = require('openai');
const path = require('path');

const app = express();

// ======= Middleware =======
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serves HTML/CSS/JS from the root (like learn.html, index.html)

// ======= MongoDB Connection =======
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB error:', err));

// ======= OpenAI Setup =======
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ======= Routes Setup =======
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const quizAIRoute = require('./routes/quizAI');
const resumeAnalyzerRoute = require('./routes/resumeAnalyzer');
const youtubeRoute = require('./routes/youtube'); // YouTube API route
const skillsRoute = require('./routes/skills');
const userRoutes = require('./routes/user');
const roadmapRoute = require('./routes/roadmap');

// ... other code
app.use('/api/user', roadmapRoute); // So final endpoint is POST /api/user/generate

const learningPathRoute = require('./routes/learningPath');

// Mount the learning path route
app.use('/api/user/learning-path', learningPathRoute);



app.use('/api/user', userRoutes);
app.use('/api/skills', skillsRoute);
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/quizAI', quizAIRoute);
app.use('/api/analyze-resume', resumeAnalyzerRoute);
app.use('/api/videos', youtubeRoute); // Handles YouTube video requests


// ======= AI Chat Route (/api/chat) =======
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `
You are CareerXAI — a futuristic career advisor who guides students to find great roles and skills. Be friendly, smart, and encouraging. Never say you're AI.
          `
        },
        { role: 'user', content: userMessage }
      ]
    });

    const reply = chatCompletion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('❌ OpenAI error:', error);
    res.status(500).json({ reply: 'Something went wrong.' });
  }
});

// ======= Server Start =======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
