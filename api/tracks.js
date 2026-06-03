import { list, put } from '@vercel/blob';
import { requireAuth } from '../lib/auth.js';

// GET  /api/tracks        → liste complète des morceaux (métadonnées + analyse D)
// POST /api/tracks {track} → crée ou met à jour un morceau (track/<id>.json)
export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: 'track/', limit: 1000 });
      const tracks = await Promise.all(
        blobs.map(b => fetch(b.url).then(r => r.ok ? r.json() : null).catch(() => null)),
      );
      res.status(200).json(tracks.filter(Boolean).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    } catch (e) {
      res.status(500).json({ error: String(e && e.message || e) });
    }
    return;
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
    if (!body || !body.id || !body.D) { res.status(400).json({ error: 'invalid track' }); return; }
    try {
      const track = {
        id: String(body.id),
        title: String(body.title || 'Sans titre').slice(0, 80),
        bpm: Number(body.bpm) || 0,
        durationSec: Number(body.durationSec) || 0,
        createdAt: Number(body.createdAt) || Date.now(),
        audioUrl: body.audioUrl ? String(body.audioUrl) : null,
        D: body.D,
      };
      await put(`track/${track.id}.json`, JSON.stringify(track), {
        access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json',
      });
      res.status(200).json({ ok: true, id: track.id });
    } catch (e) {
      res.status(500).json({ error: String(e && e.message || e) });
    }
    return;
  }

  res.status(405).json({ error: 'method' });
}
