# Image Analyzer

[![Support me on Patreon](https://img.shields.io/badge/Patreon-Support%20my%20work-FF424D?style=flat&logo=patreon&logoColor=white)](https://www.patreon.com/AndersBjarby)

A small web app for analyzing images with GPT-4o. Upload a picture, choose a tone of voice and keyword language, optionally define your own rating categories, and get back a description plus the requested analysis.

## Features

- Image upload (handled with multer)
- GPT-4o vision analysis with a configurable tone instruction
- Keyword extraction in a language of your choice
- Custom rating categories (name + description) scored by the model

## Setup

Requires `OPENAI_API_KEY` in your environment.

```bash
npm install
export OPENAI_API_KEY=sk-...
npm start
```

Serves on port 3000.

## Tech

Node.js, Express, multer, OpenAI SDK, Tailwind CSS.
