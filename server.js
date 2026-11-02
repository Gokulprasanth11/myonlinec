const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// ---------------------------------------------------------------------------
// Fallback .env loader (works without --env-file flag on Render)
// ---------------------------------------------------------------------------
if (!process.env.ONLINECOMPILER_API_KEY) {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const PORT        = parseInt(process.env.PORT, 10) || 3000;
const API_KEY     = process.env.ONLINECOMPILER_API_KEY;
const API_URL     = 'https://api.onlinecompiler.io/api/run-code-sync/';
const APP_USER    = process.env.APP_USERNAME || 'gokul';
const APP_PASS    = process.env.APP_PASSWORD || 'gokul1234';

// ---------------------------------------------------------------------------
// In-memory session store  { token -> { username, createdAt } }
// ---------------------------------------------------------------------------
const sessions = new Map();

function createSession(username) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { username, createdAt: Date.now() });
  return token;
}

function extractToken(req) {
  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return bearer;
  }
  const cookieHeader = req.headers['cookie'] || '';
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function validateSession(req) {
  const token = extractToken(req);
  if (!token) return null;
  return sessions.get(token) || null;
}

function sessionCookie(token, req, clear) {
  const forwarded = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const parts = [
    `session=${clear ? '' : token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    clear ? 'Max-Age=0' : 'Max-Age=604800',
  ];
  if (forwarded === 'https') parts.push('Secure');
  return parts.join('; ');
}

const SANDBOX_RESERVED = new Set(['input', 'run.sh', 'build', 'build.tar', 'go-trim.txt']);

function sandboxFileName(name, used) {
  let base = path.basename(String(name || 'file.txt')).replace(/[^A-Za-z0-9._-]/g, '_');
  if (!base || !/^[A-Za-z0-9]/.test(base)) base = `f_${base || 'file.txt'}`;
  if (base.split('.')[0] === 'code') base = `src_${base}`;
  let candidate = base.slice(0, 100);
  let i = 2;
  while (used.has(candidate) || SANDBOX_RESERVED.has(candidate) || candidate.split('.')[0] === 'code') {
    const dot = base.lastIndexOf('.');
    const stem = (dot === -1 ? base : base.slice(0, dot)).slice(0, 80);
    const ext = dot === -1 ? '' : base.slice(dot);
    candidate = `${stem}_${i}${ext}`.slice(0, 100);
    i += 1;
  }
  used.add(candidate);
  return candidate;
}

// ---------------------------------------------------------------------------
// MIME map & helpers
// ---------------------------------------------------------------------------
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) req.destroy(new Error('Request entity too large'));
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); }
      catch (e) { reject(new Error('Invalid JSON format in request body')); }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data, extraHeaders) {
  res.writeHead(statusCode, Object.assign({
    'Content-Type':                 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }, extraHeaders || {}));
  res.end(JSON.stringify(data));
}

function serveStaticFile(res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type':  contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma':        'no-cache',
      'Expires':       '0'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

// ---------------------------------------------------------------------------
// Public paths that don't need authentication
// ---------------------------------------------------------------------------
const PUBLIC_PATHS = new Set(['/login.html', '/login.css']);
function isPublicPath(pathname) {
  return PUBLIC_PATHS.has(pathname) || pathname === '/api/auth/login';
}

// ---------------------------------------------------------------------------
// Main HTTP server
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const url      = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // ── AUTH: Login endpoint ──────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    try {
      const { username, password } = await readRequestBody(req);
      if (
        typeof username === 'string' && typeof password === 'string' &&
        username.trim().toLowerCase() === APP_USER.toLowerCase() &&
        password === APP_PASS
      ) {
        const token = createSession(username.trim());
        sendJson(res, 200, { success: true, token }, {
          'Set-Cookie': sessionCookie(token, req, false),
        });
      } else {
        sendJson(res, 401, { success: false, error: 'Invalid username or password.' });
      }
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  // ── AUTH: Logout endpoint ────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    const token = extractToken(req);
    if (token) sessions.delete(token);
    sendJson(res, 200, { success: true }, {
      'Set-Cookie': sessionCookie('', req, true),
    });
    return;
  }

  // Re-issue the session cookie from a still-valid bearer token (page loads cannot send localStorage).
  if (req.method === 'POST' && pathname === '/api/auth/refresh') {
    const token = extractToken(req);
    const session = token ? sessions.get(token) : null;
    if (!session) {
      sendJson(res, 401, { success: false, error: 'Session expired. Please sign in again.' });
      return;
    }
    sendJson(res, 200, { success: true, username: session.username }, {
      'Set-Cookie': sessionCookie(token, req, false),
    });
    return;
  }

  // ── Redirect bare / to login if no session, else index ──────────────────
  if (req.method === 'GET' && pathname === '/') {
    const session = validateSession(req);
    if (!session) {
      res.writeHead(302, { Location: '/login.html' });
      res.end();
      return;
    }
    serveStaticFile(res, path.join(__dirname, 'public', 'index.html'));
    return;
  }

  // ── Static public files (login page, fonts, etc) ────────────────────────
  if (req.method === 'GET' && isPublicPath(pathname)) {
    const resolvedPath = path.join(__dirname, 'public', pathname);
    if (!resolvedPath.startsWith(path.join(__dirname, 'public'))) {
      res.writeHead(403); res.end('403 Forbidden'); return;
    }
    serveStaticFile(res, resolvedPath);
    return;
  }

  // ── Auth guard for everything else ──────────────────────────────────────
  if (!isPublicPath(pathname)) {
    const session = validateSession(req);
    if (!session) {
      if (req.method === 'GET' && !pathname.startsWith('/api/')) {
        res.writeHead(302, { Location: '/login.html' });
        res.end();
      } else {
        sendJson(res, 401, { success: false, error: 'Unauthorized. Please log in.' });
      }
      return;
    }
  }

  // ── API Status ───────────────────────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/status') {
    sendJson(res, 200, {
      status: 'online',
      configured: Boolean(API_KEY),
      defaultCompiler: 'gcc-15',
      supportedCompilers: [
        { id: 'gcc-15',   name: 'C (GCC 15)' },
        { id: 'clang-21', name: 'C (Clang 21)' },
        { id: 'bash-5.2', name: 'Bash 5.2 (Make / Shell)' }
      ]
    });
    return;
  }

  // ── API Code Execution ───────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/run') {
    if (!API_KEY) {
      sendJson(res, 500, { success: false, error: 'API Key not configured.' });
      return;
    }
    try {
      const payload    = await readRequestBody(req);
      const code       = payload.code;
      const input      = payload.input || '';
      const compiler   = payload.compiler || 'gcc-15';
      const timeLimit  = Math.min(Math.max(Number(payload.time_limit) || 10, 1), 30);
      const files      = Array.isArray(payload.files) ? payload.files : [];

      if (!code || typeof code !== 'string') {
        sendJson(res, 400, { success: false, error: 'Missing required field: "code".' });
        return;
      }

      const requestPayload = { compiler, code, input, time_limit: timeLimit };
      if (files.length > 0) {
        const used = new Set();
        requestPayload.files = files.slice(0, 8).map(f => ({
          name:    sandboxFileName(f.name, used),
          content: typeof f.content === 'string' ? f.content : ''
        }));
      }

      console.log(`[EXEC] ${compiler} | code=${code.length}c | files=${files.length}`);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Authorization': API_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      const responseText = await response.text();
      let responseData;
      try { responseData = JSON.parse(responseText); } catch { responseData = { raw: responseText }; }

      if (!response.ok) {
        sendJson(res, response.status, { success: false, error: responseData.message || responseData.error || `API error ${response.status}`, details: responseData });
        return;
      }
      sendJson(res, 200, { success: true, data: responseData });
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  // ── API GitHub Push ──────────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/github/push') {
    try {
      const payload = await readRequestBody(req);
      const { token, owner, repo, branch = 'main', message = 'Update from MyOnlineC IDE', files = [] } = payload;

      if (!token || !owner || !repo) {
        sendJson(res, 400, { success: false, error: 'Missing: GitHub token, owner, or repo name.' });
        return;
      }
      if (!files.length) {
        sendJson(res, 400, { success: false, error: 'No files provided to commit.' });
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token.trim()}`,
        'Accept':        'application/vnd.github.v3+json',
        'User-Agent':    'MyOnlineC-Web-IDE'
      };

      // Check/create repo
      const repoCheck = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}`, { headers });
      if (repoCheck.status === 404) {
        const createRes = await fetch('https://api.github.com/user/repos', {
          method: 'POST', headers,
          body: JSON.stringify({ name: repo.trim(), description: 'C project from MyOnlineC IDE', auto_init: true })
        });
        if (!createRes.ok) {
          const e = await createRes.json().catch(() => ({}));
          sendJson(res, 400, { success: false, error: e.message || 'Repo creation failed.' });
          return;
        }
        await new Promise(r => setTimeout(r, 1500));
      }

      // Get latest commit SHA
      let parentCommitSha = null, baseTreeSha = null;
      const refRes = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}/git/ref/heads/${branch.trim()}`, { headers });
      if (refRes.ok) {
        const refData = await refRes.json();
        parentCommitSha = refData.object.sha;
        const commitRes = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}/git/commits/${parentCommitSha}`, { headers });
        if (commitRes.ok) { const cd = await commitRes.json(); baseTreeSha = cd.tree.sha; }
      }

      // Create tree
      const treePayload = { tree: files.map(f => ({ path: f.path.replace(/^[\/\\]+/, ''), mode: '100644', type: 'blob', content: f.content })) };
      if (baseTreeSha) treePayload.base_tree = baseTreeSha;
      const treeRes = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}/git/trees`, { method: 'POST', headers, body: JSON.stringify(treePayload) });
      if (!treeRes.ok) { const e = await treeRes.json().catch(() => ({})); sendJson(res, 400, { success: false, error: e.message || 'Failed to create Git tree.' }); return; }
      const treeData = await treeRes.json();

      // Create commit
      const commitPayload = { message, tree: treeData.sha, parents: parentCommitSha ? [parentCommitSha] : [] };
      const newCommitRes = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}/git/commits`, { method: 'POST', headers, body: JSON.stringify(commitPayload) });
      if (!newCommitRes.ok) { const e = await newCommitRes.json().catch(() => ({})); sendJson(res, 400, { success: false, error: e.message || 'Failed to create commit.' }); return; }
      const newCommitData = await newCommitRes.json();

      // Update ref
      let updateRefRes;
      if (parentCommitSha) {
        updateRefRes = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}/git/refs/heads/${branch.trim()}`, { method: 'PATCH', headers, body: JSON.stringify({ sha: newCommitData.sha, force: true }) });
      } else {
        updateRefRes = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}/git/refs`, { method: 'POST', headers, body: JSON.stringify({ ref: `refs/heads/${branch.trim()}`, sha: newCommitData.sha }) });
      }
      if (!updateRefRes.ok) { const e = await updateRefRes.json().catch(() => ({})); sendJson(res, 400, { success: false, error: e.message || 'Failed to update branch ref.' }); return; }

      sendJson(res, 200, {
        success: true,
        repoUrl:   `https://github.com/${owner.trim()}/${repo.trim()}`,
        commitUrl: `https://github.com/${owner.trim()}/${repo.trim()}/commit/${newCommitData.sha}`,
        commitSha: newCommitData.sha
      });
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  // ── Static file serving (authenticated) ─────────────────────────────────
  if (req.method === 'GET') {
    const safePath     = pathname === '/' ? '/index.html' : pathname;
    const resolvedPath = path.join(__dirname, 'public', safePath);
    if (!resolvedPath.startsWith(path.join(__dirname, 'public'))) {
      res.writeHead(403); res.end('403 Forbidden'); return;
    }
    serveStaticFile(res, resolvedPath);
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('405 Method Not Allowed');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(` MyOnlineC - Modern Online C Compiler Server  `);
  console.log(`===============================================`);
  console.log(` Server  : http://0.0.0.0:${PORT}`);
  console.log(` API Key : ${API_KEY ? 'Loaded ✓' : 'MISSING ✗'}`);
  console.log(` Auth    : user="${APP_USER}" (session-based)`);
  console.log(`===============================================`);
});
