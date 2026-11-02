const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// Fallback loader for .env if not started with --env-file
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
        process.env[key] = val;
      }
    }
  }
}

const PORT = parseInt(process.env.PORT, 10) || 3000;
const API_KEY = process.env.ONLINECOMPILER_API_KEY;
const API_URL = 'https://api.onlinecompiler.io/api/run-code-sync/';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Parse incoming JSON body
function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        // 10MB safety cap
        req.destroy(new Error('Request entity too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format in request body'));
      }
    });
    req.on('error', reject);
  });
}

// Send standard JSON response
function sendJson(res, statusCode, data) {
  const json = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(json);
}

// Serve static assets from public/
function serveStaticFile(req, res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // API Status & Configuration Endpoint
  if (req.method === 'GET' && pathname === '/api/status') {
    sendJson(res, 200, {
      status: 'online',
      configured: Boolean(API_KEY),
      defaultCompiler: 'gcc-15',
      supportedCompilers: [
        { id: 'gcc-15', name: 'C (GCC 15)' },
        { id: 'clang-21', name: 'C (Clang 21)' },
        { id: 'bash-5.2', name: 'Bash 5.2 (Make / Shell)' }
      ]
    });
    return;
  }

  // API Code Execution Endpoint
  if (req.method === 'POST' && pathname === '/api/run') {
    if (!API_KEY) {
      sendJson(res, 500, {
        success: false,
        error: 'API Key not configured. Please set ONLINECOMPILER_API_KEY in .env file.'
      });
      return;
    }

    try {
      const payload = await readRequestBody(req);
      const code = payload.code;
      const input = payload.input || '';
      const compiler = payload.compiler || 'gcc-15';
      const timeLimit = Math.min(Math.max(Number(payload.time_limit) || 10, 1), 30);
      const files = Array.isArray(payload.files) ? payload.files : [];

      if (!code || typeof code !== 'string') {
        sendJson(res, 400, {
          success: false,
          error: 'Missing required field: "code" must be a non-empty string.'
        });
        return;
      }

      const requestPayload = {
        compiler: compiler,
        code: code,
        input: input,
        time_limit: timeLimit
      };

      if (files.length > 0) {
        // OnlineCompiler.io requires plain filenames without slashes
        requestPayload.files = files.map(f => ({
          name: path.basename(f.name || 'file.txt'),
          content: typeof f.content === 'string' ? f.content : ''
        }));
      }

      console.log(`[EXEC] Compiler: ${compiler} | Code: ${code.length} chars | Extra files: ${files.length} (${files.map(f => f.name).join(', ') || 'none'})`);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw: responseText };
      }

      if (!response.ok) {
        sendJson(res, response.status, {
          success: false,
          error: responseData.message || responseData.error || `Compiler API returned status ${response.status}`,
          details: responseData
        });
        return;
      }

      sendJson(res, 200, {
        success: true,
        data: responseData
      });
    } catch (err) {
      console.error('Execution error:', err);
      sendJson(res, 500, {
        success: false,
        error: err.message || 'Internal Server Error during execution'
      });
    }
    return;
  }

  // API GitHub Push Endpoint
  if (req.method === 'POST' && pathname === '/api/github/push') {
    try {
      const payload = await readRequestBody(req);
      const { token, owner, repo, branch = 'main', message = 'Update from MyOnlineC IDE', files = [] } = payload;

      if (!token || !owner || !repo) {
        sendJson(res, 400, {
          success: false,
          error: 'Missing required fields: GitHub Personal Access Token, Owner/Username, and Repo Name are required.'
        });
        return;
      }

      if (!files.length) {
        sendJson(res, 400, {
          success: false,
          error: 'No files provided to commit.'
        });
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MyOnlineC-Web-IDE'
      };

      // 1. Check if repository exists; if 404, try creating it automatically
      const repoCheck = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}`, { headers });
      if (repoCheck.status === 404) {
        const createRes = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: repo.trim(),
            description: 'C project created with MyOnlineC IDE',
            auto_init: true
          })
        });
        if (!createRes.ok) {
          const errData = await createRes.json().catch(() => ({}));
          sendJson(res, 400, {
            success: false,
            error: errData.message || 'Repository does not exist and auto-creation failed. Check token permissions.'
          });
          return;
        }
        await new Promise(r => setTimeout(r, 1500));
      }

      // 2. Fetch current latest commit SHA on branch
      let parentCommitSha = null;
      let baseTreeSha = null;
      const refRes = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}/git/ref/heads/${branch.trim()}`, { headers });
      if (refRes.ok) {
        const refData = await refRes.json();
        parentCommitSha = refData.object.sha;
        const commitRes = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}/git/commits/${parentCommitSha}`, { headers });
        if (commitRes.ok) {
          const commitData = await commitRes.json();
          baseTreeSha = commitData.tree.sha;
        }
      }

      // 3. Create Git Tree supporting folders
      const treePayload = {
        tree: files.map(f => ({
          path: f.path.replace(/^[\/\\]+/, ''),
          mode: '100644',
          type: 'blob',
          content: f.content
        }))
      };
      if (baseTreeSha) {
        treePayload.base_tree = baseTreeSha;
      }

      const treeRes = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}/git/trees`, {
        method: 'POST',
        headers,
        body: JSON.stringify(treePayload)
      });

      if (!treeRes.ok) {
        const errData = await treeRes.json().catch(() => ({}));
        sendJson(res, 400, {
          success: false,
          error: errData.message || 'Failed to create Git tree on GitHub.'
        });
        return;
      }
      const treeData = await treeRes.json();

      // 4. Create Git Commit
      const commitPayload = {
        message: message,
        tree: treeData.sha,
        parents: parentCommitSha ? [parentCommitSha] : []
      };
      const newCommitRes = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}/git/commits`, {
        method: 'POST',
        headers,
        body: JSON.stringify(commitPayload)
      });

      if (!newCommitRes.ok) {
        const errData = await newCommitRes.json().catch(() => ({}));
        sendJson(res, 400, {
          success: false,
          error: errData.message || 'Failed to create commit on GitHub.'
        });
        return;
      }
      const newCommitData = await newCommitRes.json();

      // 5. Update branch reference
      let updateRefRes;
      if (parentCommitSha) {
        updateRefRes = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}/git/refs/heads/${branch.trim()}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ sha: newCommitData.sha, force: true })
        });
      } else {
        updateRefRes = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}/git/refs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ ref: `refs/heads/${branch.trim()}`, sha: newCommitData.sha })
        });
      }

      if (!updateRefRes.ok) {
        const errData = await updateRefRes.json().catch(() => ({}));
        sendJson(res, 400, {
          success: false,
          error: errData.message || 'Failed to update branch reference on GitHub.'
        });
        return;
      }

      sendJson(res, 200, {
        success: true,
        repoUrl: `https://github.com/${owner.trim()}/${repo.trim()}`,
        commitUrl: `https://github.com/${owner.trim()}/${repo.trim()}/commit/${newCommitData.sha}`,
        commitSha: newCommitData.sha
      });
    } catch (err) {
      console.error('GitHub Push error:', err);
      sendJson(res, 500, {
        success: false,
        error: err.message || 'Internal Server Error while pushing to GitHub'
      });
    }
    return;
  }

  // Static File Serving
  if (req.method === 'GET') {
    let safePath = pathname === '/' ? '/index.html' : pathname;
    const resolvedPath = path.join(__dirname, 'public', safePath);

    // Prevent directory traversal
    if (!resolvedPath.startsWith(path.join(__dirname, 'public'))) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 Forbidden');
      return;
    }

    serveStaticFile(req, res, resolvedPath);
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('405 Method Not Allowed');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(` MyOnlineC - Modern Online C Compiler Server   `);
  console.log(`===============================================`);
  console.log(` Server running at: http://0.0.0.0:${PORT}`);
  console.log(` API Key Status   : ${API_KEY ? 'Active (Loaded)' : 'Missing'}`);
  console.log(` Default Compiler : GCC 15`);
  console.log(`===============================================`);
});

