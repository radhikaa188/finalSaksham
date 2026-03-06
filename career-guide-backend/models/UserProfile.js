const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Clerk userId
  name: String,
  preferredLanguage: { type: String, enum: ['hindi', 'english'], default: 'hindi' },
  workPreference: { type: String, enum: ['remote', 'offline', 'both'], default: 'both' },
  hoursPerDay: { type: Number, default: 2 },
  education: String,
  interests: String,
  transcript: String,        // full conversation transcript
  profileComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);