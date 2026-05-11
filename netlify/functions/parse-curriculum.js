// Netlify Function: parse-curriculum
// Accepts POST { file: base64, mediaType, fileName, uid } from the client.
// Proxies to Anthropic API using server-side key. Rate-limited 5/day per user.
// ANTHROPIC_API_KEY and FIREBASE_SERVICE_ACCOUNT must be set in Netlify dashboard.

const Anthropic = require('@anthropic-ai/sdk');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

function getDb() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

async function checkRateLimit(db, uid) {
  const ref = db.doc(`users/${uid}/aiUsage/curriculum`);
  const snap = await ref.get();
  const today = todayString();
  const data = snap.exists ? snap.data() : {};
  const callsToday = (data.lastCallDate === today) ? (data.callsToday ?? 0) : 0;
  if (callsToday >= 5) return false;
  await ref.set({ callsToday: callsToday + 1, lastCallDate: today });
  return true;
}

const SYSTEM_PROMPT = `You are a curriculum receipt parser. Extract all courses or subjects from this curriculum receipt, order confirmation, or catalog page.
Return ONLY a valid JSON array with no markdown, no explanation.
Each object must have: title (string), publisher (string, empty string if unknown). Return [] if no courses are found.`;

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Request body must be valid JSON' }) };
  }

  const { file, mediaType, fileName, uid } = body;
  if (!file || !mediaType || !uid) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields: file, mediaType, uid' }) };
  }

  try {
    const db = getDb();
    const allowed = await checkRateLimit(db, uid);
    if (!allowed) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'Daily limit reached. You can import up to 5 curricula per day.' }),
      };
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Rate limit check failed: ' + err.message }) };
  }

  try {
    const client = new Anthropic({ apiKey });

    const isImage = mediaType.startsWith('image/');
    let contentBlock;
    if (isImage) {
      contentBlock = { type: 'image', source: { type: 'base64', media_type: mediaType, data: file } };
    } else {
      contentBlock = { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: file } };
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: [
          contentBlock,
          { type: 'text', text: `Extract all curriculum courses from this document. File: ${fileName ?? 'curriculum'}` },
        ],
      }],
    });

    const raw = response.content[0].text;
    const text = raw.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
    const courses = JSON.parse(text);
    if (!Array.isArray(courses)) throw new SyntaxError('Expected an array');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courses }),
    };
  } catch (err) {
    const isJsonError = err instanceof SyntaxError;
    return {
      statusCode: isJsonError ? 422 : 500,
      body: JSON.stringify({
        error: isJsonError ? 'Model returned unparseable JSON — try a clearer document' : err.message,
      }),
    };
  }
};
