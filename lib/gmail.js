import { google } from 'googleapis';

export function hasOAuthEnv() {
  return [
    'GMAIL_CLIENT_ID',
    'GMAIL_CLIENT_SECRET',
    'GMAIL_REDIRECT_URI',
    'GMAIL_REFRESH_TOKEN',
  ].every((k) => process.env[k]);
}

export function createOAuth2Client() {
  if (!hasOAuthEnv()) {
    throw new Error(
      'Missing OAuth2 environment variables. Required: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI, GMAIL_REFRESH_TOKEN.'
    );
  }
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return oAuth2Client;
}

export function createGmailClient() {
  const auth = createOAuth2Client();
  return google.gmail({ version: 'v1', auth });
}

export function decodeMessageBody(message) {
  if (!message || !message.payload) return '';
  const partsQueue = [message.payload];
  while (partsQueue.length) {
    const part = partsQueue.shift();
    if (part.parts) partsQueue.push(...part.parts);
    if (part.mimeType === 'text/plain' && part.body && part.body.data) {
      return Buffer.from(part.body.data, 'base64').toString('utf8');
    }
  }
  return '';
}

export function extractHeaders(message, headers = ['Subject', 'From', 'Date']) {
  const headerMap = {};
  if (message?.payload?.headers) {
    for (const h of message.payload.headers) {
      if (headers.includes(h.name)) headerMap[h.name] = h.value;
    }
  }
  return headerMap;
}

export async function listLabels(gmail) {
  const res = await gmail.users.labels.list({ userId: 'me' });
  return res.data.labels || [];
}

export async function listUnread(gmail, { query = '', maxResults = 5 } = {}) {
  const q = `is:unread ${query}`.trim();
  const res = await gmail.users.messages.list({ userId: 'me', q, maxResults });
  const messages = res.data.messages || [];
  const detailed = [];
  for (const m of messages) {
    const full = await gmail.users.messages.get({ userId: 'me', id: m.id });
    const headers = extractHeaders(full.data);
    detailed.push({
      id: m.id,
      threadId: full.data.threadId,
      snippet: full.data.snippet,
      headers,
    });
  }
  return detailed;
}

export async function getEmail(gmail, { id }) {
  const res = await gmail.users.messages.get({ userId: 'me', id });
  const body = decodeMessageBody(res.data);
  const headers = extractHeaders(res.data, ['Subject', 'From', 'To', 'Date']);
  return { id, threadId: res.data.threadId, headers, snippet: res.data.snippet, body };
}

export async function archiveEmail(gmail, { id }) {
  await gmail.users.messages.modify({
    userId: 'me',
    id,
    requestBody: { removeLabelIds: ['INBOX'] },
  });
  return { id, status: 'archived' };
}

export async function deleteEmail(gmail, { id }) {
  await gmail.users.messages.trash({ userId: 'me', id });
  return { id, status: 'trashed' };
}
