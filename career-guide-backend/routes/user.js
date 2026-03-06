const express = require('express');
const { requireAuth, getAuth } = require('@clerk/express');
const Session = require('../models/Session');
const UserProfile = require('../models/UserProfile');
const router = express.Router();

// GET /api/user/profile — sab kuch return karo
router.get('/profile', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);

    // Past sessions (careers explored)
    const sessions = await Session.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Onboarding profile
    const profile = await UserProfile.findOne({ userId });

    // Stats
    const totalCareersExplored = sessions.length;
    const uniqueCareers = [...new Set(sessions.map(s => s.chosenCareer).filter(Boolean))];
    const allCourses = sessions.flatMap(s => s.courses || []);
    const recentChats = sessions.flatMap(s =>
      (s.chatHistory || []).slice(-4) // last 4 messages per session
    ).slice(-20); // overall last 20

    res.json({
      profile: profile || null,
      sessions: sessions.map(s => ({
        id: s._id,
        chosenCareer: s.chosenCareer,
        preferredLanguage: s.preferredLanguage,
        preferredJobType: s.preferredJobType,
        courseLevel: s.courseLevel,
        courses: s.courses || [],
        createdAt: s.createdAt,
      })),
      stats: {
        totalCareersExplored,
        uniqueCareers,
        totalCoursesSeen: allCourses.length,
      },
      recentChats,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;