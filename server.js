const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const users = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Admin User', role: 'Manager' }
];

let entries = [
  { id: 1, userId: 1, date: '2026-01-05', startTime: '08:00', endTime: '17:00', project: 'Platform Upgrade', status: 'Approved', note: 'Sprint planning and implementation' },
  { id: 2, userId: 1, date: '2026-01-06', startTime: '09:00', endTime: '18:00', project: 'API Integration', status: 'Pending', note: 'Integrated auth service with dashboard' }
];

const sessions = new Map();

const toMinutes = (time) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

const getDurationHours = (startTime, endTime) => Number((Math.max(0, toMinutes(endTime) - toMinutes(startTime)) / 60).toFixed(2));

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  });
  res.end(JSON.stringify(payload));
};

const sendNoContent = (res) => {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  });
  res.end();
};

const getAuthenticatedUser = (req) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return null;
  }
  const token = auth.slice(7);
  const userId = sessions.get(token);
  if (!userId) {
    return null;
  }
  return users.find((user) => user.id === userId) || null;
};

const getContentType = (filePath) => {
  const extension = path.extname(filePath);
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.jpg': 'image/jpeg'
  };
  return map[extension] || 'application/octet-stream';
};

const serveStatic = (req, res) => {
  const rawPath = req.url === '/' ? '/index.html' : req.url;
  const safePath = path.normalize(rawPath).replace(/^\.+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { message: 'Forbidden' });
    return;
  }

  fs.readFile(filePath, (err, file) => {
    if (err) {
      fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (fallbackErr, fallbackFile) => {
        if (fallbackErr) {
          sendJson(res, 404, { message: 'Not found' });
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fallbackFile);
      });
      return;
    }

    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    res.end(file);
  });
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  try {
    if (req.url === '/api/auth/login' && req.method === 'POST') {
      const { username, password } = await parseBody(req);
      const user = users.find((item) => item.username === username && item.password === password);

      if (!user) {
        sendJson(res, 401, { message: 'Invalid username or password' });
        return;
      }

      const token = crypto.randomBytes(24).toString('hex');
      sessions.set(token, user.id);
      sendJson(res, 200, {
        token,
        user: { id: user.id, username: user.username, name: user.name, role: user.role }
      });
      return;
    }

    if (req.url === '/api/users/me' && req.method === 'GET') {
      const user = getAuthenticatedUser(req);
      if (!user) {
        sendJson(res, 401, { message: 'Missing or invalid token' });
        return;
      }
      sendJson(res, 200, { id: user.id, username: user.username, name: user.name, role: user.role });
      return;
    }

    if (req.url === '/api/time-entries' && req.method === 'GET') {
      const user = getAuthenticatedUser(req);
      if (!user) {
        sendJson(res, 401, { message: 'Missing or invalid token' });
        return;
      }
      const userEntries = entries.filter((entry) => entry.userId === user.id).map((entry) => ({ ...entry, durationHours: getDurationHours(entry.startTime, entry.endTime) }));
      sendJson(res, 200, userEntries);
      return;
    }

    if (req.url === '/api/time-entries' && req.method === 'POST') {
      const user = getAuthenticatedUser(req);
      if (!user) {
        sendJson(res, 401, { message: 'Missing or invalid token' });
        return;
      }
      const { date, startTime, endTime, project, status, note } = await parseBody(req);
      if (!date || !startTime || !endTime || !project || !status) {
        sendJson(res, 400, { message: 'Required fields are missing' });
        return;
      }
      const newEntry = { id: entries.length ? Math.max(...entries.map((e) => e.id)) + 1 : 1, userId: user.id, date, startTime, endTime, project, status, note: note || '' };
      entries.push(newEntry);
      sendJson(res, 201, { ...newEntry, durationHours: getDurationHours(newEntry.startTime, newEntry.endTime) });
      return;
    }

    if (req.url.startsWith('/api/time-entries/') && req.method === 'PUT') {
      const user = getAuthenticatedUser(req);
      if (!user) {
        sendJson(res, 401, { message: 'Missing or invalid token' });
        return;
      }
      const entryId = Number(req.url.split('/').pop());
      const index = entries.findIndex((entry) => entry.id === entryId && entry.userId === user.id);
      if (index < 0) {
        sendJson(res, 404, { message: 'Entry not found' });
        return;
      }
      const payload = await parseBody(req);
      entries[index] = { ...entries[index], ...payload };
      sendJson(res, 200, { ...entries[index], durationHours: getDurationHours(entries[index].startTime, entries[index].endTime) });
      return;
    }

    if (req.url.startsWith('/api/time-entries/') && req.method === 'DELETE') {
      const user = getAuthenticatedUser(req);
      if (!user) {
        sendJson(res, 401, { message: 'Missing or invalid token' });
        return;
      }
      const entryId = Number(req.url.split('/').pop());
      const before = entries.length;
      entries = entries.filter((entry) => !(entry.id === entryId && entry.userId === user.id));
      if (entries.length === before) {
        sendJson(res, 404, { message: 'Entry not found' });
        return;
      }
      sendNoContent(res);
      return;
    }

    if (req.url === '/api/reports/summary' && req.method === 'GET') {
      const user = getAuthenticatedUser(req);
      if (!user) {
        sendJson(res, 401, { message: 'Missing or invalid token' });
        return;
      }
      const userEntries = entries.filter((entry) => entry.userId === user.id);
      const totalHours = userEntries.reduce((sum, entry) => sum + getDurationHours(entry.startTime, entry.endTime), 0);
      sendJson(res, 200, {
        totalEntries: userEntries.length,
        totalHours: Number(totalHours.toFixed(2)),
        approvedCount: userEntries.filter((entry) => entry.status === 'Approved').length,
        pendingCount: userEntries.filter((entry) => entry.status === 'Pending').length
      });
      return;
    }

    serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { message: error.message || 'Unexpected server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
