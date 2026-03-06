const mongoose = require('mongoose');

const CareerSuggestionSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  type:        { type: String },
  description: { type: String },
});

const CourseSchema = new mongoose.Schema({
  title:    String,
  platform: String,
  url:      String,
  level:    String,
});

const JobPlatformSchema = new mongoose.Schema({
  name: String,
  url:  String,
  tip:  String,
  type: String,
});

const RoadmapStepSchema = new mongoose.Schema({
  id:           String,
  title:        String,
  description:  String,
  skillsToLearn:  [String],
  estimatedWeeks: Number,
  completed:    { type: Boolean, default: false },
});

const InterestHistorySchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, index: true },

    // What the user said
    transcript: { type: String, required: true },

    // AI-suggested careers from that transcript
    careers: [CareerSuggestionSchema],

    // The one they picked (null if they never selected)
    selectedCareer: {
      title:       String,
      type:        String,
      description: String,
    },

    // Resources fetched after selection
    courses:  [CourseSchema],
    jobs:     [JobPlatformSchema],
    roadmap:  [RoadmapStepSchema],

    // Progress tracking (mirrors SavedCareer)
    completedCourses: { type: [String], default: [] },
    appliedJobs:      { type: [String], default: [] },
  },
  { timestamps: true }   // createdAt + updatedAt auto-managed
);

module.exports = mongoose.model('InterestHistory', InterestHistorySchema);