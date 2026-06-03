import { makeToken } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const pw = (body && body.password) || '';
  const expected = process.env.APP_PASSWORD || '';
  if (expected && pw === expected) {
    const tok = makeToken(30);
    res.setHeader('Set-Cookie', `qc_auth=${tok}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${30 * 864e2}`);
    res.status(200).json({ ok: true });
  } else {
    res.status(401).json({ error: 'bad password' });
  }
}
