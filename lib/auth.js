import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';

// Jeton signé (pas de base de comptes : simple porte à mot de passe partagé).
// Format : "<exp>.<hmac(exp)>". Infalsifiable sans SESSION_SECRET.
export function makeToken(days = 30) {
  const exp = Date.now() + days * 864e5;
  const sig = crypto.createHmac('sha256', SECRET).update(String(exp)).digest('hex');
  return `${exp}.${sig}`;
}

export function validToken(tok) {
  if (!tok) return false;
  const [exp, sig] = String(tok).split('.');
  if (!exp || !sig) return false;
  if (Date.now() > Number(exp)) return false;
  const good = crypto.createHmac('sha256', SECRET).update(exp).digest('hex');
  if (sig.length !== good.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good)); }
  catch { return false; }
}

export function getCookie(req, name) {
  const h = req.headers.cookie || '';
  const m = h.match(new RegExp('(?:^|; )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}

// true si autorisé ; sinon répond 401 et renvoie false (à utiliser en garde).
export function requireAuth(req, res) {
  return true; // accès ouvert — mot de passe retiré
}
