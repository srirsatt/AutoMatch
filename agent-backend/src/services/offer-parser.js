const path = require('path');
const { supabaseAdmin } = require('../config/supabase');

const {
    documentAiClient,
    customerDocsBucket,
} = require('../config/google-cloud');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_BUCKET = process.env.SUPABASE_DEALER_OFFERS_BUCKET;
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const LOCATION = process.env.DOCUMENT_AI_LOCATION;


const DOC_PROCESSOR = {
    contract: process.env.CONTRACT_PROCESSOR_ID,
}

const VERTEX_API_KEY = process.env.VERTEX_API_KEY;
const VERTEX_LOCATION = process.env.VERTEX_LOCATION;
const VERTEX_MATCH_AGENT = process.env.VERTEX_MATCH_AGENT;

function requireEnv(value, key) {
    if (!value) throw new Error(`Missing env: ${key}`);
    return value;
}

const MIME_TYPES = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
}

function guessMimeType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/pdf';
}

async function downloadFromSupabase(filePath) {
    requireEnv(SUPABASE_BUCKET, 'SUPABASE_DEALER_OFFERS_BUCKET');

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
    const processorId = requireEnv(DOC_PROCESSOR[docType], `${docType} id`);
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

function buildParagraphExtractor(document) {
  const fullText = document.text || '';

  function sliceFromTextAnchor(anchor) {
    if (!anchor) return null;
    if (anchor.content) return anchor.content.trim();

    const segments = anchor.textSegments || [];
    return segments
        .map(({ startIndex = 0, endIndex }) => {
            const end = endIndex ?? fullText.length;
            return fullText.substring(startIndex, end);
        })
        .join('')
        .trim();
  }

  return () => {
    const out = [];
    for (const pg of (document.pages || [])) {
      for (const par of (pg.paragraphs || [])) {
        const text = sliceFromTextAnchor(par.layout?.textAnchor);
        if (text) out.push(text);
      }
  }
  return out;
    };
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

async function processCustomerDocument({ customerId, docType, filePath }) {
    requireEnv(PROJECT_ID, 'GOOGLE_CLOUD_PROJECT_ID');
    requireEnv(LOCATION, 'DOCUMENT_AI_LOCATION');

    if (!DOC_PROCESSOR[docType]) {
        throw new Error(`Unsupported doc type ${docType}`);
    }

    const fileBuffer = await downloadFromSupabase(filePath);
    const mimeType = guessMimeType(filePath);
    const gcsDestination = path.posix.join(customerId, docType, path.basename(filePath));
    const gcsUri = await uploadToGcs(fileBuffer, gcsDestination, mimeType);

    const parsedDocument = await processWithDocAi(docType, gcsUri, mimeType);

    const paragraphs = buildParagraphExtractor(parsedDocument)();
    const entities = indexEntities(parsedDocument);

    // store it (document_ingestions.parsed_fields)
    return {
        customerId,
        docType,
        supabasePath: filePath,
        gcsUri,
        paragraphs,
        entities,
        rawDocument: parsedDocument
    };
}

async function runMatchAgent(payload) {
    requireEnv(VERTEX_API_KEY, 'VERTEX_API_KEY');
    requireEnv(VERTEX_LOCATION, 'VERTEX_LOCATION');
    requireEnv(VERTEX_MATCH_AGENT, 'VERTEX_MATCH_AGENT');

    const url = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/${VERTEX_MATCH_AGENT}:generateContent`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': VERTEX_API_KEY,
        },
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: JSON.stringify(payload) }] }],
            generationConfig: {
                temperature: 0.3,
                responseMimeType: 'application/json',
            },
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Vertex request failed: ${res.status} ${body}`);
    }

    const data = await res.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    return JSON.parse(answer);
}

async function buildVertexPayload(customerId) {
    const [{ data: docRows, error: docError }, { data: cars, error: carError }] = 
        await Promise.all([
            supabaseAdmin
                .from('customer_documents')
                .select('doc_type, file_path')
                .eq('customer_id', customerId),
            supabaseAdmin
                .from('dealer_offers')
                .select('pdf_url'),
        ]);

    if (docError) throw new Error(`${docError.message}`);
    if (carError) throw new Error(`${carError.message}`);

    const parsedDocs = await Promise.all(
        (docRows || []).map((row) => 
            processCustomerDocument({
                customerId,
                pdfUrl: car.pdfUrl,
            })
        )
    );

    const docMap = parsedDocs.reduce((acc, doc) => {
        acc[doc.docType] = doc;
        return acc;
    }, {});

    return {
        customerId,
        documents: {
            w2: docMap.w2?.paragraphs ?? [],
            identity: docMap.identity?.paragraphs ?? [],
            offer: docMap.pdfUrl?.paragraphs ?? [],
        },
        entities: {
            w2: docMap.w2?.entities ?? {},
            identity: docMap.identity?.entities ?? {},
            offer: docMap.pdfUrl?.entities ?? {},
        },
        instructions: [
            'Role: automotive finance assistant.',
            'Use W-2 and license info, and offer document to give financial addice.',
            'Return JSON: { "recommendations": [ { "apr": number, "payment": number, "time": number } ] }',
            'Provide exactly 3 reccomendations for three differnent payment plans (different aprs, payment amts, and time amts), make 3 for different scenarios, do not include more than 3 entries.'
        ].join('\n'),
    };
}

async function runVertexMatch(customerId, { persist = true } = {}) {
  const payload = await buildVertexPayload(customerId);
  const result = await runMatchAgent(payload);

  const recommendations = result?.recommendations ?? [];
  if (!persist || recommendations.length === 0) return recommendations;

  const upsertRows = recommendations.map((rec) => ({
    monthly: rec.payment,
    apr: rec.apr,
    term_months: rec.time,
  }));

  await supabaseAdmin
    .from('pricing_plans')
    .upsert(upsertRows);

  return recommendations;
}