require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const OpenAI = require('openai');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const base64Image = fs.readFileSync(req.file.path, { encoding: 'base64' });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image and provide a JSON response with keywords, rating (1-10), and description." },
            {
              type: "image_url",
              image_url: `data:image/${req.file.mimetype};base64,${base64Image}`,
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json(JSON.parse(response.choices[0].message.content));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 