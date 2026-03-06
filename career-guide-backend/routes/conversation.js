const express = require('express');
const multer = require('multer');
const { requireAuth, getAuth } = require('@clerk/express');
const { processConversationTurn, startConversation } = require('../services/conversation');
const { transcribeAudio } = require('../services/gcpSpeech');
const UserProfile = require('../models/UserProfile');
const router = express.Router();
const upload = multer();

// AI starts conversation — first call
router.get('/start', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const result = await startConversation(userId);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// User sends voice → AI responds
router.post('/turn', requireAuth(), upload.single('audio'), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const history = JSON.parse(req.body.history || '[]');

    // Transcribe user audio (AWS Transcribe)
    const transcript = await transcribeAudio(req.file.buffer);

    // Process conversation turn (Bedrock + Polly inside)
    const result = await processConversationTurn(userId, transcript, history);

    res.json({ ...result, userTranscript: transcript });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Get saved profile
router.get('/profile', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const profile = await UserProfile.findOne({ userId });
    res.json({ profile: profile || null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;