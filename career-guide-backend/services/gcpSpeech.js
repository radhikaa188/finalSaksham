const speech = require('@google-cloud/speech');

const credentials = JSON.parse(process.env.GCP_CREDENTIALS_JSON);

const client = new speech.SpeechClient({ credentials });

async function transcribeAudio(audioBuffer) {
  const [response] = await client.recognize({
    audio: { content: audioBuffer.toString('base64') },
    config: {
      encoding: 'MP3',
      sampleRateHertz: 16000,
      languageCode: 'hi-IN',
      alternativeLanguageCodes: ['en-US'],
      enableAutomaticPunctuation: true,
    },
  });
  return response.results.map(r => r.alternatives[0].transcript).join(' ');
}

module.exports = { transcribeAudio };