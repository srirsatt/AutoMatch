// agent-backend/bin/run-vertex-match.js
require('dotenv').config({ path: process.env.ENV_PATH || '.env.local' });

const { runVertexMatch } = require('../src/services/document-parser');

const customerId = process.argv[2];
if (!customerId) {
  console.error('Usage: node bin/run-vertex-match.js <customerId>');
  process.exit(1);
}

runVertexMatch(customerId)
  .then((recs) => console.log(JSON.stringify(recs, null, 2)))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
