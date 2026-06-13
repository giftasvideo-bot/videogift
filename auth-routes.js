// ─────────────────────────────────────────────────────────────────────────────
// Forever 27 — Admin Auth Routes
// Add this to your Express server (server.js / index.js on Render)
//
// 1. npm install jsonwebtoken
// 2. Set these environment variables in your Render dashboard:
//      ADMIN_USERNAME   (e.g. admin)
//      ADMIN_PASSWORD   (e.g. a strong password — not "forever27")
//      JWT_SECRET       (a long random string, e.g. output of: openssl rand -hex 32)
// ─────────────────────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');

const JWT_SECRET       = process.env.JWT_SECRET       || 'change-this-secret';
const ADMIN_USERNAME   = process.env.ADMIN_USERNAME   || 'admin';
const ADMIN_PASSWORD   = process.env.ADMIN_PASSWORD   || 'forever27';
const TOKEN_EXPIRY     = '8h';

// Middleware — protect any route that requires authentication
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired. Please sign in again.' });
  }
}

// ── POST /api/admin/login ─────────────────────────────────────────────────────
// Body: { username, password }
// Returns: { token }  on success
//          { message } on failure (401)
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    return res.json({ token });
  }

  // Uniform delay prevents timing-based username enumeration
  setTimeout(() => {
    res.status(401).json({ message: 'Incorrect username or password.' });
  }, 400);
});

// ── GET /api/admin/verify ─────────────────────────────────────────────────────
// Called by admin.html on load to confirm the token is still valid server-side.
app.get('/api/admin/verify', requireAuth, (req, res) => {
  res.json({ ok: true, user: req.admin.username });
});

// ─────────────────────────────────────────────────────────────────────────────
// Protect your existing admin routes by adding the requireAuth middleware.
// Examples:
//
//   app.post('/api/admin/batch-insert', requireAuth, async (req, res) => { ... });
//   app.delete('/api/gift/:id',         requireAuth, async (req, res) => { ... });
//
// Public routes (watch.html status checks) do NOT need requireAuth.
// ─────────────────────────────────────────────────────────────────────────────

module.exports = { requireAuth };
