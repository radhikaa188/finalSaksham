const express = require('express');
const multer = require('multer');
const { transcribeAudio } = require('../services/gcpSpeech');
const { ask } = require('../services/gemini');
const router = express.Router();
const upload = multer();

// Original route — transcribe + career suggestions
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const transcript = await transcribeAudio(req.file.buffer);

    // In backend/routes/speech.js — replace the prompt inside /transcribe route with this:

const lang = req.body.language || 'en'; // 'en' or 'hi' sent from frontend
const descLang = lang === 'hi' ? 'Hindi (हिंदी में लिखें)' : 'English';

const prompt = `
A person described themselves in Hindi, English, or Hinglish: "${transcript}"
Their profile: Education: ${req.body.education || 'unknown'}, Goal: ${req.body.goal || 'unknown'}, City: ${req.body.city || 'unknown'}

Suggest 5 career paths suitable for them.

STRICT RULES:
- "title": ALWAYS in English (e.g. "Web Developer", "Chef", "Content Creator")
- "description": Write in ${descLang} only — 1-2 sentences, friendly tone, explain why it suits them
- "type": either "freelance" or "traditional"
- Return ONLY a raw JSON array starting with [, no markdown, no extra text

[{ "title": "...", "type": "freelance|traditional", "description": "..." }]
`;
    const careers = await ask(prompt);
    res.json({ transcript, careers });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// NEW route — sirf transcription, no Gemini (AgentChat voice loop ke liye)
router.post('/transcribe-only', upload.single('audio'), async (req, res) => {
  try {
    const transcript = await transcribeAudio(req.file.buffer);
    res.json({ transcript });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

const textToSpeech = require('@google-cloud/text-to-speech');
const credentials = JSON.parse(process.env.GCP_CREDENTIALS_JSON);
const ttsClient = new textToSpeech.TextToSpeechClient({ credentials });

router.post('/speak', async (req, res) => {
  try {
    const { text } = req.body;
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text },
      voice: { languageCode: 'hi-IN', name: 'hi-IN-Wavenet-D' },
      audioConfig: { audioEncoding: 'MP3' },
    });
    res.set('Content-Type', 'audio/mpeg');
    res.send(response.audioContent);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;