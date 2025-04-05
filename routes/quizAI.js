const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

// v4 approach
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', async (req, res) => {
  try {
    const { conversation, userMessage } = req.body;

    // Detailed system instructions
    const systemPrompt = {
      role: 'system',
      content: `
You are "Career Quiz AI".
Your role is to discover the user's interests, goals, and personality by asking about 6-7 open-ended questions, one question at a time.
After the user provides enough info, you must produce a final message that:
- Summarizes their recommended career.
- Says "goodbye".
- You will observed about the user interest and also keep in mind about it
- Then, on a new line, includes a valid JSON snippet that maps each possible career role to a success percentage of the user possible interest. For example:
  {
    "Software Engineer": 85,
    "Data Scientist": 92,
    "UI/UX Designer": 73
  }
The JSON must be valid. Do NOT wrap it in code fences or extra text. Just plain JSON.
Use the user’s actual conversation to vary the percentages. The conversation includes:
${JSON.stringify(conversation)}
Be short, friendly, and use emojis occasionally. 
If user says "start quiz", greet and begin with your first question.
If user has answered enough, produce your final summary, say "goodbye," then output the JSON snippet.
`
    };

    // Reconstruct the conversation for GPT
    const chatMessages = [systemPrompt];

    // Add prior conversation messages (role: user or assistant)
    for (let msg of conversation) {
      chatMessages.push({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      });
    }

    // Add the current user message
    chatMessages.push({
      role: 'user',
      content: userMessage
    });

    // Call GPT with higher temperature for more variation
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: chatMessages,
      temperature: 1.0,  // Increase to encourage more creative / varied results
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("quizAI error:", err);
    res.status(500).json({ reply: "Oops, something went wrong with the quiz AI." });
  }
});

module.exports = router;
