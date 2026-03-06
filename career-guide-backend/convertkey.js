const fs = require('fs');
const key = fs.readFileSync('./gcp-key.json', 'utf8');
const minified = JSON.stringify(JSON.parse(key)); // parse then stringify = clean single line
console.log(`GCP_CREDENTIALS_JSON=${minified}`);