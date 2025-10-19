#!/usr/bin/env node
// agent-backend/bin/run-parser.js
require('dotenv').config({ path: process.env.ENV_PATH || '.env.local' });

const path = require('path');
const { processCustomerDocument } = require('../src/services/document-parser');

const [customerId, docType, supabasePath] = process.argv.slice(2);

if (!customerId || !docType || !supabasePath) {
  console.error('Usage: node bin/run-parser.js <customerId> <docType> <supabasePath>');
  console.error('Example: node bin/run-parser.js 0f1c... w2 d5a.../w2/w2-2023.pdf');
  process.exit(1);
}

async function main() {
  try {
    const parsed = await processCustomerDocument({
      customerId,
      docType,
      filePath: supabasePath,
    });

    console.log(JSON.stringify(parsed, null, 2));
  } catch (err) {
    console.error('Failed to process document:\n', err);
    process.exitCode = 1;
  }
}

main();
