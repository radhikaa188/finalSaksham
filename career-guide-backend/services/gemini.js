const { VertexAI } = require('@google-cloud/vertexai');

// Parse credentials from env variable instead of file
const credentials = JSON.parse(process.env.GCP_CREDENTIALS_JSON);

const vertex = new VertexAI({ 
  project: process.env.GOOGLE_PROJECT_ID, 
  location: 'us-central1',
  googleAuthOptions: {
    credentials  // pass directly, no file needed
  }
});

const model = vertex.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

async function ask(prompt) {
  const result = await model.generateContent(prompt);
  const text = result.response.candidates[0].content.parts[0].text;
  
  let cleaned = text.replace(/```json|```/g, '').trim();
  const jsonMatch = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (!jsonMatch) throw new Error("Gemini ne JSON nahi diya: " + cleaned);
  
  return JSON.parse(jsonMatch[0]);
}

module.exports = { ask };