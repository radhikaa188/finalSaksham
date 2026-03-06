/**
 * routes/interestHistory.js
 *
 * Endpoints
 *   GET  /api/interest-history          — fetch all past searches for this user
 *   POST /api/interest-history          — save a new search (transcript + careers)
 *   PATCH /api/interest-history/:id     — update after career selected (adds courses/jobs/roadmap)
 *   PATCH /api/interest-history/:id/progress — update completedCourses / appliedJobs
 *   DELETE /api/interest-history/:id    — delete a single past search
 *
 * Auth: expects Clerk JWT → clerkUserId extracted from req.auth (set by Clerk middleware)
 */

const express = require('express');
const { requireAuth } = require('@clerk/express');   // adjust import to your Clerk version
const InterestHistory = require('../models/InterestHistory');

const router = express.Router();

// ── All routes require a valid Clerk session ──────────────────────────────────
router.use(requireAuth());

// Helper: extract clerk user id from request
const getUserId = (req) => req.auth?.userId;

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/interest-history
// Returns all past searches for the logged-in user, newest first
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const clerkUserId = getUserId(req);
    const history = await InterestHistory.find({ clerkUserId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ history });
  } catch (err) {
    console.error('GET /interest-history error:', err);
    res.status(500).json({ error: 'Failed to fetch interest history' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/interest-history
// Called right after speech transcription + career suggestions are ready (step 0→1)
// Body: { transcript, careers }
// Returns: { historyId }  ← frontend stores this to use in PATCH calls
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const clerkUserId = getUserId(req);
    const { transcript, careers } = req.body;

    if (!transcript || !careers) {
      return res.status(400).json({ error: 'transcript and careers are required' });
    }

    const entry = await InterestHistory.create({
      clerkUserId,
      transcript,
      careers,
    });

// await UserProfile.findOneAndUpdate(
//   { userId: clerkUserId },
//   { 
//     $set: { 
//       interests: transcript,      // keep profile.interests = latest search
//       transcript: transcript,
//       updatedAt: new Date()
//     } 
//   }
// );


    res.status(201).json({ historyId: entry._id });
  } catch (err) {
    console.error('POST /interest-history error:', err);
    res.status(500).json({ error: 'Failed to save interest history' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/interest-history/:id
// Called after user selects a career and courses/jobs are fetched (step 1→2)
// Body: { selectedCareer, courses, jobs, roadmap }
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const clerkUserId = getUserId(req);
   const { selectedCareer, courses, jobs, roadmap } = req.body;

const entry = await InterestHistory.findOneAndUpdate(
  { _id: req.params.id, clerkUserId },
  { 
    $set: { 
      'selectedCareer.title': selectedCareer.title,
      'selectedCareer.type': selectedCareer.type,
      'selectedCareer.description': selectedCareer.description,
      courses, 
      jobs, 
      roadmap 
    } 
  },
  { new: true }
);

    if (!entry) return res.status(404).json({ error: 'History entry not found' });

    res.json({ success: true, entry });
  } catch (err) {
    console.error('PATCH /interest-history/:id error:', err);
    res.status(500).json({ error: 'Failed to update interest history' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/interest-history/:id/progress
// Called whenever user marks a course done or a job applied
// Body: { completedCourses?, appliedJobs?, roadmap? }
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/progress', async (req, res) => {
  try {
    const clerkUserId = getUserId(req);
    const { completedCourses, appliedJobs, roadmap } = req.body;

    const updateFields = {};
    if (completedCourses !== undefined) updateFields.completedCourses = completedCourses;
    if (appliedJobs !== undefined)      updateFields.appliedJobs      = appliedJobs;
    if (roadmap !== undefined)          updateFields.roadmap          = roadmap;

    const entry = await InterestHistory.findOneAndUpdate(
      { _id: req.params.id, clerkUserId },
      { $set: updateFields },
      { new: true }
    );

    if (!entry) return res.status(404).json({ error: 'History entry not found' });

    res.json({ success: true, entry });
  } catch (err) {
    console.error('PATCH /interest-history/:id/progress error:', err);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/interest-history/:id
// Deletes a single past search (user triggered)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const clerkUserId = getUserId(req);

    const result = await InterestHistory.findOneAndDelete({
      _id: req.params.id,
      clerkUserId,
    });

    if (!result) return res.status(404).json({ error: 'History entry not found' });

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /interest-history/:id error:', err);
    res.status(500).json({ error: 'Failed to delete history entry' });
  }
});

module.exports = router;