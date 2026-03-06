const textToSpeech = require('@google-cloud/text-to-speech');

const credentials = JSON.parse(process.env.GCP_CREDENTIALS_JSON);
const client = new textToSpeech.TextToSpeechClient({ credentials });

async function speak(text, language = 'hindi') {
  const voiceMap = {
    hindi:   { languageCode: 'hi-IN', name: 'hi-IN-Chirp3-HD-Aoede' },  // FEMALE, most natural
    english: { languageCode: 'en-IN', name: 'en-IN-Chirp3-HD-Aoede' }   // FEMALE, most natural
  };

  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: voiceMap[language] || voiceMap.hindi,
    audioConfig: { audioEncoding: 'MP3' }
  });

  return response.audioContent.toString('base64');
}

module.exports = { speak };