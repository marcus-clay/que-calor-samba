import { handleUpload } from '@vercel/blob/client';
import { validToken, getCookie } from '../lib/auth.js';

// Émet un jeton d'upload client direct vers Blob (l'audio ne transite pas par la
// fonction, qui est limitée à 4,5 Mo de corps). Protégé par le cookie de session.
export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }
  // accès ouvert — mot de passe retiré

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/m4a', 'audio/aac',
          'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/flac', 'application/octet-stream',
        ],
        maximumSizeInBytes: 60 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => { /* rien : le client renvoie l'URL au POST /api/tracks */ },
    });
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({ error: String(e && e.message || e) });
  }
}
