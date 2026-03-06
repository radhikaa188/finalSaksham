require('dotenv').config();
const textToSpeech = require('@google-cloud/text-to-speech');

const credentials = JSON.parse(process.env.GCP_CREDENTIALS_JSON);
const client = new textToSpeech.TextToSpeechClient({ credentials });

async function listVoices() {
  const [result] = await client.listVoices({ languageCode: 'hi-IN' });
  console.log('\n=== Hindi (hi-IN) voices available ===');
  result.voices.forEach(v => {
    console.log(`${v.name} — ${v.ssmlGender}`);
  });

  const [result2] = await client.listVoices({ languageCode: 'en-IN' });
  console.log('\n=== English India (en-IN) voices available ===');
  result2.voices.forEach(v => {
    console.log(`${v.name} — ${v.ssmlGender}`);
  });
}

listVoices().catch(console.error);