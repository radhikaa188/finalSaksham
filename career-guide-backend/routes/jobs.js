const express = require('express');
const router = express.Router();

router.post('/platforms', async (req, res) => {
  const { career } = req.body;
  const q = encodeURIComponent(career);
  const slug = career.toLowerCase().replace(/\s+/g, '-');

  const platforms = [
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/jobs/search/?keywords=${q}`,
      type: 'full-time',
      tip: 'दुनियाभर की नौकरियां, networking के लिए सबसे अच्छा'
    },
    {
      name: 'Naukri',
      url: `https://www.naukri.com/${slug}-jobs`,
      type: 'full-time',
      tip: 'भारत का नंबर 1 जॉब पोर्टल'
    },
    {
      name: 'Internshala',
      url: `https://internshala.com/internships/${slug}-internship`,
      type: 'internship',
      tip: 'Students के लिए best — internships और fresher jobs'
    },
    {
      name: 'Upwork',
      url: `https://www.upwork.com/nx/search/jobs/?q=${q}`,
      type: 'freelance',
      tip: 'International freelance clients मिलेंगे'
    },
    {
      name: 'Fiverr',
      url: `https://www.fiverr.com/search/gigs?query=${q}`,
      type: 'freelance',
      tip: 'Gig-based काम, beginners के लिए भी अच्छा'
    },
    {
      name: 'Freelancer',
      url: `https://www.freelancer.in/jobs/${slug}/`,
      type: 'freelance',
      tip: 'Global projects पर bid करो'
    },
  ];

  res.json({ platforms });
});

module.exports = router;