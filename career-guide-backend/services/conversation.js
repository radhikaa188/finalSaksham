const { ask } = require('./gemini');
const { speak } = require('./tts');
const UserProfile = require('../models/UserProfile');

async function processConversationTurn(userId, userTranscript, conversationHistory) {
  const historyText = conversationHistory
    .map(h => `${h.role}: ${h.text}`)
    .join('\n');

  const prompt = `
You are an AI career counselor doing a voice onboarding conversation with an Indian student.

Conversation so far:
${historyText || 'This is the first message'}

User just said: "${userTranscript}"

Your job:
1. Understand what user said (Hindi/English/Hinglish)
2. Extract any profile info (language preference, work preference, hours/day, education, interests)
3. Ask the next relevant question naturally
4. If all 4 questions answered, say a warm closing message and set profileComplete: true

Collect these 4 things in order:
- preferredLanguage (hindi or english)
- workPreference (remote, offline, or both)
- hoursPerDay (number)
- education + interests (one question)

Rules:
- Respond in user's preferred language
- Keep responses short (1-2 sentences)
- Ask ONE question at a time
- Be warm and encouraging

Respond ONLY in this exact JSON format (no extra text):
{
  "aiResponse": "Your next question or closing message",
  "detectedLanguage": "hindi or english",
  "extractedData": {
    "preferredLanguage": null,
    "workPreference": null,
    "hoursPerDay": null,
    "education": null,
    "interests": null
  },
  "profileComplete": false,
  "conversationDone": false
}
`;

  // Bedrock (Claude) — replaces Gemini
  const parsed = await ask(prompt);

  // Polly TTS — replaces GCP TTS
  const audioBase64 = await speak(
    parsed.aiResponse,
    parsed.detectedLanguage || 'hindi'
  );

  // Save to MongoDB
  if (parsed.extractedData) {
    const updateData = {};
    Object.entries(parsed.extractedData).forEach(([key, val]) => {
      if (val !== null && val !== undefined) updateData[key] = val;
    });
    if (parsed.profileComplete) {
      updateData.profileComplete = true;
      updateData.updatedAt = new Date();
    }
    if (Object.keys(updateData).length > 0) {
      await UserProfile.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { upsert: true, new: true }
      );
    }
  }

  return {
    aiText: parsed.aiResponse,
    aiAudio: audioBase64,
    detectedLanguage: parsed.detectedLanguage,
    profileComplete: parsed.profileComplete || false,
    conversationDone: parsed.conversationDone || false
  };
}

async function startConversation(userId) {
  const existing = await UserProfile.findOne({ userId });

  if (existing?.profileComplete) {
    const msg = existing.preferredLanguage === 'english'
      ? "Your profile is already saved! Go to career guide."
      : "आपका profile पहले से saved है! Career guide पर जाएं।";

    const audioBase64 = await speak(msg, existing.preferredLanguage || 'hindi');
    return { aiText: msg, aiAudio: audioBase64, profileComplete: true, alreadyDone: true };
  }

  const openingMessage = "नमस्ते! मैं आपका AI career guide हूँ। क्या आप Hindi में बात करना चाहते हैं या English में?";
  const audioBase64 = await speak(openingMessage, 'hindi');

  return { aiText: openingMessage, aiAudio: audioBase64, profileComplete: false, alreadyDone: false };
}

module.exports = { processConversationTurn, startConversation };