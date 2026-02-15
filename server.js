const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 4173;
const SECRET = process.env.VAULTIX_SECRET || 'vaultix-dev-secret';
const DATA_FILE = path.join(__dirname, 'backend/data/store.json');
const WEB_ROOT = __dirname;

const sessions = new Map();

function readStore() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function writeStore(store) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(password, hash) {
  const [salt, key] = (hash || '').split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derived, 'hex'));
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}
function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (sig !== expected) return null;
  return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
}

function send(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); }
    });
  });
}

function getUserFromReq(req, store) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return store.users.find((u) => u.id === payload.userId) || null;
}

function seedPasswordsIfMissing() {
  const store = readStore();
  let changed = false;
  for (const user of store.users) {
    if (!user.passwordHash) {
      user.passwordHash = hashPassword('Password123!');
      changed = true;
    }
  }
  if (changed) writeStore(store);
}
seedPasswordsIfMissing();

function routeApi(req, res, pathname) {
  const store = readStore();

  if (req.method === 'POST' && pathname === '/api/auth/register') {
    return parseBody(req).then((body) => {
      const { name, email, password, role, organization } = body;
      if (!name || !email || !password || !role) return send(res, 400, { error: 'Missing required fields' });
      if (store.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) return send(res, 409, { error: 'Email already registered' });
      const user = {
        id: `u_${Date.now()}`,
        name,
        email,
        role,
        organization: organization || 'Independent',
        phone: '',
        location: '',
        bio: '',
        passwordHash: hashPassword(password)
      };
      store.users.push(user);
      writeStore(store);
      send(res, 201, { message: 'Registered successfully' });
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    return parseBody(req).then((body) => {
      const user = store.users.find((u) => u.email.toLowerCase() === String(body.email || '').toLowerCase());
      if (!user || !verifyPassword(body.password || '', user.passwordHash)) return send(res, 401, { error: 'Invalid credentials' });
      const preToken = signToken({ userId: user.id, stage: 'otp', ts: Date.now() });
      sessions.set(preToken, { otp: '123456', userId: user.id, expiresAt: Date.now() + 10 * 60 * 1000 });
      send(res, 200, { otpRequired: true, token: preToken, demoOtp: '123456', role: user.role });
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/verify-otp') {
    return parseBody(req).then((body) => {
      const rec = sessions.get(body.token);
      if (!rec || rec.expiresAt < Date.now()) return send(res, 401, { error: 'OTP session expired' });
      if (body.otp !== rec.otp) return send(res, 401, { error: 'Invalid OTP' });
      const token = signToken({ userId: rec.userId, stage: 'auth', ts: Date.now() });
      sessions.delete(body.token);
      send(res, 200, { token });
    });
  }

  if (pathname === '/api/analytics' && req.method === 'GET') {
    const pending = store.accessRequests.filter((r) => r.status === 'pending').length;
    return send(res, 200, {
      storageUsage: Math.min(100, store.files.reduce((a, f) => a + f.sizeMb, 0)),
      accessTrends: 63,
      approvalRates: store.accessRequests.length ? Math.round((store.accessRequests.filter((r) => r.status === 'approved').length / store.accessRequests.length) * 100) : 0,
      categories: ['Legal', 'Finance', 'Security'],
      pendingRequests: pending
    });
  }

  const user = getUserFromReq(req, store);

  if (pathname === '/api/profile' && req.method === 'GET') {
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    const { passwordHash, ...safe } = user;
    return send(res, 200, safe);
  }

  if (pathname === '/api/profile' && req.method === 'PUT') {
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    return parseBody(req).then((body) => {
      ['name', 'phone', 'organization', 'location', 'bio'].forEach((key) => {
        if (typeof body[key] === 'string') user[key] = body[key];
      });
      writeStore(store);
      send(res, 200, { message: 'Profile updated' });
    });
  }

  if (pathname === '/api/settings' && req.method === 'GET') {
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    const defaults = { notifications: true, theme: 'lavender-glass', otpEnabled: true };
    return send(res, 200, store.settings[user.id] || defaults);
  }

  if (pathname === '/api/settings' && req.method === 'PUT') {
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    return parseBody(req).then((body) => {
      store.settings[user.id] = { ...(store.settings[user.id] || {}), ...body };
      writeStore(store);
      send(res, 200, { message: 'Settings saved' });
    });
  }

  if (pathname.startsWith('/api/dashboard/') && req.method === 'GET') {
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    const role = pathname.split('/').pop();
    if (role === 'data_owner') {
      const ownFiles = store.files.filter((f) => f.ownerId === user.id);
      return send(res, 200, {
        totalFiles: ownFiles.length,
        storageUsedMb: ownFiles.reduce((a, f) => a + f.sizeMb, 0),
        requestsReceived: store.accessRequests.filter((r) => ownFiles.some((f) => f.id === r.fileId)).length,
        approvedUsers: new Set(store.accessRequests.filter((r) => r.status === 'approved').map((r) => r.requesterId)).size
      });
    }
    if (role === 'data_user') {
      return send(res, 200, {
        availableFiles: store.files.length,
        requestsMade: store.accessRequests.filter((r) => r.requesterId === user.id).length,
        approvalsReceived: store.accessRequests.filter((r) => r.requesterId === user.id && r.status === 'approved').length
      });
    }
    return send(res, 200, {
      approvalQueue: store.accessRequests.filter((r) => r.status === 'pending').length,
      highRisk: store.accessRequests.filter((r) => r.risk === 'high').length,
      auditLogs: store.accessRequests.length
    });
  }

  if (pathname === '/api/files' && req.method === 'GET') {
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    return send(res, 200, store.files);
  }

  if (pathname === '/api/files' && req.method === 'POST') {
    if (!user || user.role !== 'data_owner') return send(res, 403, { error: 'Only data owners can upload' });
    return parseBody(req).then((body) => {
      if (!body.name) return send(res, 400, { error: 'File name required' });
      const file = {
        id: `f_${Date.now()}`,
        name: body.name,
        category: body.category || 'General',
        sizeMb: Number(body.sizeMb || 1),
        ownerId: user.id,
        permission: body.permission || 'Internal'
      };
      store.files.push(file);
      writeStore(store);
      send(res, 201, file);
    });
  }

  if (pathname === '/api/access-requests' && req.method === 'GET') {
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    const ownFileIds = new Set(store.files.filter((f) => f.ownerId === user.id).map((f) => f.id));
    const data = user.role === 'data_user'
      ? store.accessRequests.filter((r) => r.requesterId === user.id)
      : user.role === 'data_owner'
      ? store.accessRequests.filter((r) => ownFileIds.has(r.fileId))
      : store.accessRequests;
    return send(res, 200, data);
  }

  if (pathname === '/api/access-requests' && req.method === 'POST') {
    if (!user || user.role !== 'data_user') return send(res, 403, { error: 'Only data users can request access' });
    return parseBody(req).then((body) => {
      const file = store.files.find((f) => f.id === body.fileId);
      if (!file) return send(res, 404, { error: 'File not found' });
      const reqItem = {
        id: `r_${Date.now()}`,
        fileId: file.id,
        requesterId: user.id,
        status: 'pending',
        reason: body.reason || 'Business request',
        risk: body.risk || 'low',
        createdAt: new Date().toISOString()
      };
      store.accessRequests.push(reqItem);
      writeStore(store);
      send(res, 201, reqItem);
    });
  }

  if (pathname.startsWith('/api/access-requests/') && req.method === 'PATCH') {
    if (!user || !['data_owner', 'trust_authority'].includes(user.role)) return send(res, 403, { error: 'Forbidden' });
    const id = pathname.split('/').pop();
    return parseBody(req).then((body) => {
      const reqItem = store.accessRequests.find((r) => r.id === id);
      if (!reqItem) return send(res, 404, { error: 'Request not found' });
      reqItem.status = body.status === 'approved' ? 'approved' : 'rejected';
      writeStore(store);
      send(res, 200, reqItem);
    });
  }

  send(res, 404, { error: 'Not found' });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname.startsWith('/api/')) return routeApi(req, res, pathname);

  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(WEB_ROOT, pathname);
  if (!filePath.startsWith(WEB_ROOT)) {
    res.writeHead(403); return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });
});

server.listen(PORT, () => {
  console.log(`Vaultix server running on http://0.0.0.0:${PORT}`);
  console.log('Demo users: owner@vaultix.io, user@vaultix.io, authority@vaultix.io / Password123!');
});
