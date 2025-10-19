// essentially, this file loads up google cloud services
const { Storage } = require('@google-cloud/storage');
const { DocumentProcessorServiceClient } = require('@google-cloud/documentai'); // documentAI load

require('dotenv').config();

// initialize gcloud from env
const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

// doc ai initialization
const documentAiClient = new DocumentProcessorServiceClient({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const customerDocsBucket = storage.bucket(process.env.GCS_BUCKET_CUSTOMER_DOCS);
const contractsBucket = storage.bucket(process.env.GCS_BUCKET_CONTRACTS);

module.exports = {
    storage,
    documentAiClient,
    customerDocsBucket,
    contractsBucket
};
