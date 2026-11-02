// Adapted from week09/auction-room: three views, QR entry, SSE + polling, admin key, backup.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Platform, fresh } = require('./platform');
function createApp({ dataFile = process.env.DATA_FILE || path.join(__dirname, 'data/session.json'), adminKey = process.env.ADMIN_KEY || crypto.randomBytes(12).toString('hex'), publicUrl = process.env.PUBLIC_URL || '' } = {}) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  let state = fresh();
  if (fs.existsSync(dataFile)) {
    state = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    if (state.version !== 1 || !Array.isArray(state.players) || !state.walk || !state.price) throw new Error('Unrecognized session file. Restore a backup or choose a new DATA_FILE.');
  }
  const game = new Platform(state, s => {
    const temp = dataFile + '.tmp';
    fs.writeFileSync(temp, JSON.stringify(s), { mode: 0o600, flush: true });
    fs.renameSync(temp, dataFile);
  });
  const clients = new Map();
  const json = (res, code, data) => { res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(data)); };
  const view = token => ({ ...game.view(token), publicUrl: publicUrl.replace(/\/$/, '') });
  function broadcast() {
    for (const [res, token] of clients) {
      if (res.writableLength > 1024 * 1024) { res.destroy(); clients.delete(res); }
      else res.write(`data: ${JSON.stringify(view(token))}\n\n`);
    }
  }
  const files = { '/': 'play.html', '/play': 'play.html', '/screen': 'screen.html', '/admin': 'admin.html', '/common.js': 'common.js', '/style.css': 'style.css', '/qrcode.js': 'qrcode.js' };
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const token = req.headers.authorization?.replace(/^Bearer /, '') || url.searchParams.get('token');
      res.setHeader('referrer-policy', 'no-referrer');
      res.setHeader('x-content-type-options', 'nosniff');
      if (req.method === 'GET' && files[url.pathname]) {
        const file = files[url.pathname];
        res.writeHead(200, { 'content-type': file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html', 'cache-control': 'no-store' });
        return res.end(fs.readFileSync(path.join(__dirname, 'public', file)));
      }
      if (req.method === 'GET' && url.pathname === '/api/backup') {
        if (url.searchParams.get('key') !== adminKey) return json(res, 403, { error: 'Incorrect instructor key.' });
        game.expire(); return json(res, 200, game.s);
      }
      if (req.method === 'GET' && url.pathname === '/api/admin/state') {
        if (url.searchParams.get('key') !== adminKey) return json(res, 403, { error: 'Incorrect instructor key.' });
        return json(res, 200, { ...game.adminView(), publicUrl: publicUrl.replace(/\/$/, '') });
      }
      if (req.method === 'GET' && url.pathname === '/state') return json(res, 200, view(token));
      if (req.method === 'GET' && url.pathname === '/events') {
        res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive', 'x-accel-buffering': 'no' });
        res.write(`data: ${JSON.stringify(view(token))}\n\n`);
        clients.set(res, token); req.on('close', () => clients.delete(res)); return;
      }
      if (req.method !== 'POST') return json(res, 404, { error: 'Not found.' });
      // Browser requests must originate here; no cross-origin instructor mutations.
      if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}` && req.headers.origin !== `https://${req.headers.host}`) return json(res, 403, { error: 'Wrong origin.' });
      let raw = '';
      for await (const chunk of req) { raw += chunk; if (raw.length > 16384) return json(res, 413, { error: 'Request too large.' }); }
      const b = JSON.parse(raw || '{}');
      let result;
      if (url.pathname === '/api/join') result = game.join(b.name, token);
      else if (url.pathname === '/api/choose') result = game.choose(token, b);
      else if (url.pathname.startsWith('/api/admin/')) {
        if (url.searchParams.get('key') !== adminKey) return json(res, 403, { error: 'Incorrect instructor key. Open the console URL printed by the server.' });
        result = game.admin(url.pathname.slice('/api/admin/'.length), b);
      } else return json(res, 404, { error: 'Not found.' });
      broadcast(); json(res, 200, result);
    } catch (error) {
      const disk = /^(EACCES|ENOSPC|EIO|EROFS|ENOENT)$/.test(error.code || '');
      if (disk) console.error('Session save failed:', error.message);
      if (!res.headersSent) json(res, disk ? 503 : 400, { error: disk ? 'Session could not be saved. No action was accepted; ask the instructor to check disk storage.' : error.message });
      else res.destroy();
    }
  });
  const timer = setInterval(() => {
    try { game.expire(); broadcast(); } catch (e) { console.error('Platform Room update failed:', e.message); }
  }, 250);
  timer.unref();
  server.on('close', () => clearInterval(timer));
  return { server, game, adminKey };
}
if (require.main === module) {
  const { server, adminKey } = createApp();
  const port = Number(process.env.PORT || 3010);
  server.listen(port, '0.0.0.0', () => {
    console.log(`Platform Room: http://localhost:${port}/\nProjector: http://localhost:${port}/screen\nInstructor: http://localhost:${port}/admin?key=${adminKey}`);
  });
}
module.exports = { createApp };
