const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: String,
  transcript: String,
  careers: Array,
  chosenCareer: String,
  courses: Array,       // courses seen for this career
  jobPlatforms: Array,
  chatHistory: [        // agent conversation history
    {
      role: { type: String, enum: ['user', 'assistant'] },
      content: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  preferredLanguage: { type: String, default: 'hindi' },
  preferredJobType: { type: String, default: 'both' },
  courseLevel: { type: String, default: 'beginner' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);