const express = require('express');
const multer = require('multer');
const path = require('path');
const OpenAI = require('openai');
const fs = require('fs');

const app = express();
const port = 3000;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Make sure to set this environment variable
});

// Set up multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Add near the top of the file, after creating the app
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle image upload
app.post('/analyze', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
        const toneInstruction = req.body.toneInstruction || 'Describe it in a neutral, objective way';
        const keywordLanguage = req.body.keywordLanguage || 'English';
        const ratingCategories = JSON.parse(req.body.ratingCategories || '[]');
        const ratingInstructions = ratingCategories.map(cat => 
            `${cat.name} (${cat.description})`
        ).join(', ');

        // Read the image file as base64
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString('base64');

        // Call GPT-4O API
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an image analysis assistant that provides responses in JSON format with the following structure: { 
                        ratings: { [category: string]: number }, 
                        description: string, 
                        keywords: string[] 
                    }. Provide keywords in ${keywordLanguage}. Rate each category out of 10.`
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this image and provide: 1) Ratings out of 10 for the following categories: ${ratingInstructions}, 2) A detailed description (${toneInstruction}), 3) Keywords that best describe it in ${keywordLanguage}.`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            response_format: {
                type: "json_object"
            },
            temperature: 0.7,
            max_completion_tokens: 500
        });

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Get the response content
        const analysis = response.choices[0].message.content;
        res.json(JSON.parse(analysis));

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error analyzing image' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Image Analyzer web application running at http://localhost:${port}`);
}); 