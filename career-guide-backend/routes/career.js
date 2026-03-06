const express = require('express');
const { ask } = require('../services/gemini');

const router = express.Router();

router.post('/suggest', async (req, res) => {
  const { transcript } = req.body;
  // routes/career.js prompt
const prompt = `
  A person described themselves: "${transcript}"
  Suggest 5 career paths suitable for them.

  IMPORTANT: Return ONLY a raw JSON array. No explanation, no intro text, no markdown.
  Start your response with [ and end with ]

  [{ "title": "...", "type": "freelance|traditional", "description": "..." }]
`;
  const careers = await ask(prompt);
  res.json({ careers });
});

module.exports = router;