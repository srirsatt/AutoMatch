const path = require('path');
const { supabaseAdmin } = require('../config/supabase');
const {
    documentAiClient,
    customerDocsBucket,
} = require('../config/google-cloud');

const SUPABASE_BUCKET = process.env.SUPABASE_CUSTOMER_DOCS_BUCKET;
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const LOCATION = process.env.DOCUMENT_AI_LOCATION;

const DOC_PROCESSORS = {
    w2: process.env.W2_PROCESSOR_ID,
    identity: process.env.LICENSE_PROCESSOR_ID,
};

const IMPORTANT_FIELDS = {
  w2: {
    employeeName: 'employee_name',
    employeeSsn: 'employee_ssn',
    employerName: 'employer_name',
    wages: 'wages_tips_other_comp',
    federalWithholding: 'federal_income_tax_withheld',
    socialSecurityWages: 'social_security_wages',
    medicareWages: 'medicare_wages_and_tips',
  },
  identity: {
    licenseNumber: 'license_number',
    firstName: 'first_name',
    lastName: 'last_name',
    dateOfBirth: 'date_of_birth',
    expirationDate: 'expiry_date',
    address: 'address',
    issuingState: 'issuing_state',
  },
};

const MIME_TYPES = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
}

function requireEnv(value, key) {
    if (!value) {
        throw new Error(`Missing env var: ${key}`);
    }
    return value;
}

function guessMimeType(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    return MIME_TYPES[extension] || 'application/pdf';
}

async function downloadFromSupabase(filePath) {
    requireEnv(SUPABASE_BUCKET, 'SUPABASE_CUSTOMER_DOCS_BUCKET');

    const { data, error } = await supabaseAdmin.storage
        .from(SUPABASE_BUCKET)
        .download(filePath);
    
    if (error) {
        throw new Error(`Supabase download failed for ${filePath}: ${error.message}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

async function uploadToGcs(buffer, destinationPath, contentType) {
    const file = customerDocsBucket.file(destinationPath);
    await file.save(buffer, {
        resumable: false,
        contentType,
    });
    return `gs://${customerDocsBucket.name}/${destinationPath}`;
}

async function processWithDocAi(docType, gcsUri, mimeType) {
    const processorId = requireEnv(DOC_PROCESSORS[docType], `${docType} processor`);
    const name = documentAiClient.processorPath(PROJECT_ID, LOCATION, processorId);

    const request = {
        name,
        gcsDocument: {
            gcsUri,
            mimeType,
        },
    };

    const [result] = await documentAiClient.processDocument(request);
    return result.document;
}

function getEntityValue(entity) {
    return (
        entity.normalizedValue?.text ??
        entity.mentionText ??
        entity.textAnchor?.content ??
        null
    );
}

function indexEntities(document) {
    const map = {};
    for (const entity of document.entities || []) {
        const key = entity.type;
        const value = getEntityValue(entity);
        if (!key || !value) continue;

        if (map[key]) {
            if (Array.isArray(map[key])) {
                map[key].push(value);
            } else {
                map[key] = [map[key], value];
            }
        } else {
            map[key] = value;
        }
    }
    return map;
}

function extractImportantFields(document, docType) {
    const fields = {};
    const wantedTypes = IMPORTANT_FIELDS[docType] || {};
    for (const [fieldKey, entityType] of Object.entries(wantedTypes)) {
        const entity = document.entities?.find((entry) => entry.type === entityType) || null;

        if (!entity) continue;

        fields[fieldKey] = {
            value: getEntityValue(entity),
            confidence: entity.confidence ?? null,
        };
    }
    return fields;
}

async function processCustomerDocument({ customerId, docType, filePath }) {
    requireEnv(PROJECT_ID, 'GOOGLE_CLOUD_PROJECT_ID');
    requireEnv(LOCATION, 'DOCUMENT_AI_LOCATION');

    if (!DOC_PROCESSORS[docType]) {
        throw new Error(`Unsupported doc type ${docType}`);
    }

    const fileBuffer = await downloadFromSupabase(filePath);
    const mimeType = guessMimeType(filePath);
    const gcsDestination = path.posix.join(customerId, docType, path.basename(filePath));
    const gcsUri = await uploadToGcs(fileBuffer, gcsDestination, mimeType);

    const parsedDocument = await processWithDocAi(docType, gcsUri, mimeType);

    return {
        customerId, 
        docType,
        supabasePath: filePath,
        gcsUri,
        parsedAt: new Date().toISOString(),
        processorId: DOC_PROCESSORS[docType],
        importantFields: extractImportantFields(parsedDocument, docType),
        entities: indexEntities(parsedDocument),
        paragraphs: parsedDocument?.text ? parsedDocument.text.split('\n') : [],
    };
}

module.exports = {
    processCustomerDocument,
};