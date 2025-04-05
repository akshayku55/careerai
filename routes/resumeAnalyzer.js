const express = require('express');
const multer = require('multer');
const { OpenAI } = require('openai');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let resumeText = '';

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(dataBuffer);

      if (parsed.text.trim().length > 30) {
        resumeText = parsed.text;
      } else {
        // If it's an image-based PDF, extract text via OCR
        console.log('🧠 Using OCR for image-based PDF...');
        const imgBuffer = fs.readFileSync(filePath);
        const result = await Tesseract.recognize(imgBuffer, 'eng');
        resumeText = result.data.text;
      }

    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      resumeText = result.value;

    } else if (ext === '.txt') {
      resumeText = fs.readFileSync(filePath, 'utf-8');

    } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      console.log('🧠 Using OCR for image...');
      const imageBuffer = fs.readFileSync(filePath);
      const result = await Tesseract.recognize(imageBuffer, 'eng');
      resumeText = result.data.text;

    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Unsupported file format. Please use PDF, DOCX, TXT, JPG, or PNG.' });
    }

    fs.unlinkSync(filePath); // Clean up

    // AI Prompt
    const prompt = `
You are CareerXAI, a professional resume analyzer AI.

Analyze the resume below and give:

✅ **Professional Summary**  
✅ **Strengths**  
⚠️ **Weaknesses**  
💡 **Suggestions**  
🎯 **Ideal Career Roles with Success %**

Resume:
"""
${resumeText}
"""`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a resume analysis expert AI.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    const reply = response.choices[0].message.content;
    res.json({ analysis: reply });

  } catch (error) {
    console.error('❌ Resume Analyzer Error:', error);
    res.status(500).json({ error: 'Resume analysis failed. Please try again.' });
  }
});

module.exports = router;
