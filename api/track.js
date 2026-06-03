import { list, del } from '@vercel/blob';
import { requireAuth } from '../lib/auth.js';

// DELETE /api/track?id=<id> → supprime le JSON du morceau + son audio dans le Blob
export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'DELETE') { res.status(405).json({ error: 'method' }); return; }

  const id = (req.query && req.query.id) || '';
  if (!id) { res.status(400).json({ error: 'missing id' }); return; }

  try {
    const { blobs } = await list({ prefix: `track/${id}.json` });
    const meta = blobs[0];
    let audioUrl = null;
    if (meta) {
      const t = await fetch(meta.url).then(r => r.ok ? r.json() : null).catch(() => null);
      audioUrl = t && t.audioUrl;
    }
    const toDelete = [];
    if (meta) toDelete.push(meta.url);
    if (audioUrl) toDelete.push(audioUrl);
    if (toDelete.length) await del(toDelete);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message || e) });
  }
}
