const express = require('express');
const { requireAuth, getAuth } = require('@clerk/express');
const { runAgent } = require('../services/agent');
const router = express.Router();

router.post('/chat', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { message, history = [], context = {} } = req.body;

    // Voice-first ke liye — message ko context mein bhi daalo
    const enrichedContext = {
      ...context,
      lastMessage: message,
      userId
    };

    const result = await runAgent(history, message, enrichedContext, userId);
    res.json(result);
  } catch (e) {
    console.error('Agent error:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;