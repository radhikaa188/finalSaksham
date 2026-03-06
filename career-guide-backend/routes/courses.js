const express = require('express');
const { searchCourses } = require('../services/youtube');
const router = express.Router();

router.post('/suggest', async (req, res) => {
  try {
    const { career } = req.body;

    // Real YouTube courses
    const youtubeCourses = await searchCourses(career);

    // Map level to Hindi
    const levelMap = {
      'beginner': 'शुरुआती',
      'intermediate': 'मध्यम',
      'advanced': 'उन्नत',
      'various': 'सभी levels के लिए',
    };

    const mappedCourses = youtubeCourses.map(c => ({
      ...c,
      level: levelMap[c.level] || 'शुरुआती'
    }));

    // Udemy search URL (no API needed)
    const udemyCourse = {
      title: `"${career}" के Courses Udemy पर खोजो`,
      platform: 'Udemy',
      url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(career)}&sort=highest-rated`,
      channel: 'Udemy',
      level: 'सभी levels के लिए',
      thumbnail: null
    };

    res.json({ courses: [...mappedCourses, udemyCourse] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;