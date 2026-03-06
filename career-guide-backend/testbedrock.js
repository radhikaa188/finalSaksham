require('dotenv').config();
const { ask } = require('./services/bedrock');

ask('Say hello in one word, return JSON: {"word": "..."}')
  .then(r => console.log('Bedrock works:', r))
  .catch(e => console.error('Error:', e.message));