// Transport adapted from week09/auction-room's common.js (SSE + polling, opaque reconnect token).
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = x => `${Math.round(x * 100)}%`;
const money = x => (x >= 0 ? '+' : '') + x.toFixed(2);
let token = localStorage.getItem('cap6318-platform-token') || '', state, offset = 0, lastUpdate = 0;
const key = new URLSearchParams(location.search).get('key') || '';
async function post(url, data) {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
  const result = await res.json(); if (!res.ok) throw new Error(result.error || 'Request failed.'); return result;
}
function message(text, success = false) { $('message').textContent = text; $('message').style.color = success ? 'var(--good)' : 'var(--bad)'; }
async function action(fn) { try { await fn(); } catch (e) { message(e.message); } }
function connect(onState) {
  let es, pollTimer, fallback, stopped = false, polling = false;
  const accept = s => { lastUpdate = Date.now(); state = s; offset = s.serverTime - Date.now(); onState(s); };
  const poll = async () => { if (stopped) return; try { const r = await fetch('/state', { cache: 'no-store', headers: { authorization: `Bearer ${token}` } }); if (r.ok) accept(await r.json()); } catch {} if (!stopped) pollTimer = setTimeout(poll, 500); };
  const startPolling = () => { if (stopped || polling) return; polling = true; es?.close(); clearTimeout(fallback); poll(); };
  if (new URLSearchParams(location.search).has('poll')) startPolling();
  else {
    es = new EventSource('/events' + (token ? '?token=' + encodeURIComponent(token) : ''));
    es.onmessage = e => { clearTimeout(fallback); accept(JSON.parse(e.data)); };
    es.onerror = startPolling; fallback = setTimeout(startPolling, 4000);
  }
  return () => { stopped = true; es?.close(); clearTimeout(pollTimer); clearTimeout(fallback); };
}
function connectAdmin(onState) {
  let timer, stopped = false;
  const poll = async () => { if (stopped) return; try { const r = await fetch('/api/admin/state?key=' + encodeURIComponent(key), { cache: 'no-store' }); if (r.ok) { const s = await r.json(); lastUpdate = Date.now(); state = s; offset = s.serverTime - Date.now(); onState(s); } } catch {} if (!stopped) timer = setTimeout(poll, 600); };
  poll();
  return () => { stopped = true; clearTimeout(timer); };
}
function tickConnection() {
  if ($('connection')) $('connection').textContent = Date.now() - lastUpdate > 4000 ? 'Connection interrupted \u2022 reconnecting\u2026' : 'Live';
}
setInterval(tickConnection, 250);

// --- Lecture math, ported from platform.js (kept in sync; browser cannot require() Node CJS) ---
const networkValue = (n, a, b) => a + b * n;
const realizedAdoption = (nExpected, p, a, b) => Math.min(1, Math.max(0, 1 - p / networkValue(nExpected, a, b)));
function bisectZero(h, left, right, tol = 1e-10, maxiter = 200) {
  let fLeft = h(left), fRight = h(right);
  if (Math.abs(fLeft) < tol) return left;
  if (Math.abs(fRight) < tol) return right;
  if (fLeft * fRight > 0) throw new Error('no bracket');
  for (let i = 0; i < maxiter; i++) {
    const mid = (left + right) / 2, fMid = h(mid);
    if (Math.abs(fMid) < tol || right - left < tol) return mid;
    if (fLeft * fMid < 0) right = mid; else { left = mid; fLeft = fMid; }
  }
  return (left + right) / 2;
}
function fixedPoints(g, gridSize = 2000, tol = 1e-7) {
  const xs = Array.from({ length: gridSize + 1 }, (_, i) => i / gridSize);
  const gaps = xs.map(x => g(x) - x);
  const roots = [];
  for (let i = 0; i < xs.length; i++) if (Math.abs(gaps[i]) < tol) roots.push(xs[i]);
  for (let i = 0; i < xs.length - 1; i++) if (gaps[i] * gaps[i + 1] < 0) roots.push(bisectZero(n => g(n) - n, xs[i], xs[i + 1]));
  roots.sort((a, b) => a - b);
  const unique = [];
  for (const r of roots) if (!unique.length || Math.abs(r - unique[unique.length - 1]) > 1e-5) unique.push(r);
  return unique;
}
function responseSlope(n, p, a, b) {
  const raw = 1 - p / (a + b * n);
  if (raw <= 0 || raw >= 1) return 0;
  return (p * b) / (a + b * n) ** 2;
}
function stratifiedShare(N, joinsAt) { if (N <= 0) return 0; let c = 0; for (let k = 1; k <= N; k++) if (joinsAt((k - 0.5) / N)) c++; return c / N; }
function twoSidedStep(nDe, nRe, pD, pR, paramsD, paramsR, ND, NR) {
  const fD = networkValue(nRe, paramsD.a, paramsD.b), fR = networkValue(nDe, paramsR.a, paramsR.b);
  return { nD: stratifiedShare(ND, x => x * fD >= pD), nR: stratifiedShare(NR, x => x * fR >= pR) };
}
function simulateTwoSided({ nDe, nRe, L, s, paramsD, paramsR, ND, NR, rounds }) {
  const pD = s * L, pR = (1 - s) * L, path = [{ nDe, nRe }];
  for (let i = 0; i < rounds; i++) { const { nD, nR } = twoSidedStep(nDe, nRe, pD, pR, paramsD, paramsR, ND, NR); nDe = nD; nRe = nR; path.push({ nDe, nRe }); }
  return path;
}

// --- Hand-drawn SVG charts (no canvas libraries, no CDN) ---------------------------------------
// Charts are sized in viewBox units close to their actual rendered pixel size at the 1366x768
// design target, so font-size values below translate roughly 1:1 into on-screen pixels there
// (and larger at higher resolutions, since the SVG scales up with its container).
const TICKS = [0, 0.25, 0.5, 0.75, 1];
const sub = (base, s) => `${base}<tspan baseline-shift="sub" font-size="0.7em">${s}</tspan>`;
const sup = (base, s) => `${base}<tspan baseline-shift="super" font-size="0.7em">${s}</tspan>`;
function svgWrap(w, h, inner, label) { return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(label)}">${inner}</svg>`; }
function axesWithTicks(w, h, pad, fontSize) {
  const parts = [`<rect x="${pad.l}" y="${pad.t}" width="${w - pad.l - pad.r}" height="${h - pad.t - pad.b}" fill="none" stroke="#d8d8d1"/>`];
  for (const t of TICKS) {
    const x = sx(t, w, pad), y = sy(t, h, pad);
    parts.push(`<line x1="${x}" y1="${h - pad.b}" x2="${x}" y2="${h - pad.b + 7}" stroke="#aaa"/>`);
    parts.push(`<text x="${x}" y="${h - pad.b + fontSize + 10}" font-size="${fontSize}" fill="#60605b" text-anchor="middle">${t}</text>`);
    parts.push(`<line x1="${pad.l - 7}" y1="${y}" x2="${pad.l}" y2="${y}" stroke="#aaa"/>`);
    parts.push(`<text x="${pad.l - 12}" y="${y + fontSize * 0.35}" font-size="${fontSize}" fill="#60605b" text-anchor="end">${t}</text>`);
  }
  return parts;
}
const sx = (x, w, pad) => pad.l + x * (w - pad.l - pad.r);
const sy = (y, h, pad) => h - pad.b - y * (h - pad.t - pad.b);

// Cobweb/staircase diagram for one or two one-sided markets on g(n^e; p).
function cobwebChart(markets, { revealTheory = false, highlightLast = false, w = 860, h = 560, a = 0.1, b = 1.0 } = {}) {
  const pad = { l: 96, r: 26, t: 56, b: 64 };
  const fontTick = 19, fontAxis = 21, fontLegend = 21, fontEq = 20;
  const parts = axesWithTicks(w, h, pad, fontTick);
  parts.push(`<line x1="${sx(0, w, pad)}" y1="${sy(0, h, pad)}" x2="${sx(1, w, pad)}" y2="${sy(1, h, pad)}" stroke="#999" stroke-dasharray="5,5"/>`);
  markets.forEach((m, i) => {
    const swatchX = pad.l + i * 190;
    parts.push(`<rect x="${swatchX}" y="14" width="22" height="22" rx="4" fill="${m.color}"/>`);
    parts.push(`<text x="${swatchX + 30}" y="31" font-size="${fontLegend}" fill="${m.color}" font-weight="700">${esc(m.label ? `Market ${m.label}` : '')}</text>`);
  });
  for (const m of markets) {
    const g = x => realizedAdoption(x, m.p, a, b);
    const pts = []; for (let i = 0; i <= 100; i++) { const x = i / 100; pts.push(`${sx(x, w, pad)},${sy(g(x), h, pad)}`); }
    parts.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="${m.color}" stroke-width="3"/>`);
    const stair = (m.history || []).map(r => `M ${sx(r.nE, w, pad)} ${sy(0, h, pad)} L ${sx(r.nE, w, pad)} ${sy(r.nRealized, h, pad)} L ${sx(r.nRealized, w, pad)} ${sy(r.nRealized, h, pad)}`);
    if (stair.length) parts.push(`<path d="${stair.join(' ')}" fill="none" stroke="${m.color}" stroke-width="2" stroke-dasharray="4,3" opacity=".85"/>`);
    const last = (m.history || [])[m.history.length - 1];
    if (last) {
      const r = highlightLast ? 9 : 5;
      if (highlightLast) parts.push(`<circle class="pulse-ring" cx="${sx(last.nRealized, w, pad)}" cy="${sy(last.nRealized, h, pad)}" r="14" fill="none" stroke="${m.color}" stroke-width="2.5"/>`);
      parts.push(`<circle cx="${sx(last.nRealized, w, pad)}" cy="${sy(last.nRealized, h, pad)}" r="${r}" fill="${m.color}"/>`);
    }
    if (revealTheory) {
      const eq = fixedPoints(g);
      for (const r of eq) parts.push(`<circle cx="${sx(r, w, pad)}" cy="${sy(r, h, pad)}" r="6.5" fill="white" stroke="${m.color}" stroke-width="3"/>`);
      if (eq.length === 3) parts.push(`<text x="${sx(eq[1], w, pad) + 10}" y="${sy(eq[1], h, pad) - 12}" font-size="${fontEq}" font-weight="700" fill="${m.color}">${sub('n', 'L')}=${eq[1].toFixed(3)}</text>`);
    }
  }
  parts.push(`<text x="${(pad.l + w - pad.r) / 2}" y="${h - 14}" font-size="${fontAxis}" fill="#60605b" text-anchor="middle">expected ${sup('n', 'e')}</text>`);
  parts.push(`<text x="14" y="${(pad.t + h - pad.b) / 2}" font-size="${fontAxis}" fill="#60605b" text-anchor="middle" transform="rotate(-90 14 ${(pad.t + h - pad.b) / 2})">realized n</text>`);
  return svgWrap(w, h, parts.join(''), 'Cobweb diagram of realized adoption against expected adoption');
}

// Two-sided (n_D, n_R) phase plot with trajectory + optional dashed theory overlay.
function phaseChart(history, theoryPath, { w = 720, h = 300, highlightLast = false } = {}) {
  const pad = { l: 92, r: 24, t: 50, b: 74 };
  const fontTick = 20, fontAxis = 22, fontLegend = 21;
  const parts = axesWithTicks(w, h, pad, fontTick);
  parts.push(`<rect x="${pad.l}" y="14" width="20" height="20" rx="4" fill="#294fc4"/><text x="${pad.l + 27}" y="30" font-size="${fontLegend}" fill="#294fc4" font-weight="700">actual</text>`);
  if (theoryPath && theoryPath.length) {
    const lx = pad.l + 130;
    parts.push(`<line x1="${lx}" y1="22" x2="${lx + 28}" y2="22" stroke="#af2525" stroke-width="3" stroke-dasharray="5,3"/><text x="${lx + 36}" y="30" font-size="${fontLegend}" fill="#af2525" font-weight="700">theory (rational play)</text>`);
  }
  if (history.length) {
    const pts = history.map(e => `${sx(e.nD, w, pad)},${sy(e.nR, h, pad)}`);
    parts.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="#294fc4" stroke-width="2.5"/>`);
    history.forEach(e => parts.push(`<circle cx="${sx(e.nD, w, pad)}" cy="${sy(e.nR, h, pad)}" r="4" fill="#294fc4"/>`));
    const last = history[history.length - 1];
    if (highlightLast) parts.push(`<circle class="pulse-ring" cx="${sx(last.nD, w, pad)}" cy="${sy(last.nR, h, pad)}" r="13" fill="none" stroke="#294fc4" stroke-width="2.5"/><circle cx="${sx(last.nD, w, pad)}" cy="${sy(last.nR, h, pad)}" r="7" fill="#294fc4"/>`);
  }
  if (theoryPath && theoryPath.length) {
    const pts = theoryPath.map(e => `${sx(e.nDe, w, pad)},${sy(e.nRe, h, pad)}`);
    parts.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="#af2525" stroke-width="2.5" stroke-dasharray="5,3"/>`);
    parts.push(`<circle cx="${sx(theoryPath[0].nDe, w, pad)}" cy="${sy(theoryPath[0].nRe, h, pad)}" r="4.5" fill="#af2525"/>`);
  }
  parts.push(`<text x="${(pad.l + w - pad.r) / 2}" y="${h - 18}" font-size="${fontAxis}" fill="#60605b" text-anchor="middle">diner share ${sub('n', 'D')}</text>`);
  parts.push(`<text x="14" y="${(pad.t + h - pad.b) / 2}" font-size="${fontAxis}" fill="#60605b" text-anchor="middle" transform="rotate(-90 14 ${(pad.t + h - pad.b) / 2})">restaurant share ${sub('n', 'R')}</text>`);
  return svgWrap(w, h, parts.join(''), 'Phase plot of diner share against restaurant share');
}

// Seesaw: fulcrum is fixed; the beam tilts with the structure slider s. Each price label sits
// in a fixed clear band above or below its own end of the beam, never crossing the beam itself.
function seesawChart(s, L, { w = 420, h = 165 } = {}) {
  const barY = 66, amp = 25, barX1 = 58, barX2 = w - 58, fulcrumX = w / 2, fontLabel = 22, fontCaption = 20;
  const leftY = barY + (s - 0.5) * 2 * amp, rightY = barY - (s - 0.5) * 2 * amp;
  const leftLabelY = leftY <= barY ? leftY - 14 : leftY + 26;
  const rightLabelY = rightY <= barY ? rightY - 14 : rightY + 26;
  return svgWrap(w, h, `
    <line x1="${barX1}" y1="${leftY}" x2="${barX2}" y2="${rightY}" stroke="#294fc4" stroke-width="7" stroke-linecap="round"/>
    <polygon points="${fulcrumX - 14},${barY + 30} ${fulcrumX + 14},${barY + 30} ${fulcrumX},${barY}" fill="#60605b"/>
    <circle cx="${barX1}" cy="${leftY}" r="5" fill="#294fc4"/><circle cx="${barX2}" cy="${rightY}" r="5" fill="#294fc4"/>
    <text x="${barX1}" y="${leftLabelY}" font-size="${fontLabel}" font-weight="700" fill="#233c85">Diners p=${(s * L).toFixed(2)}</text>
    <text x="${barX2}" y="${rightLabelY}" font-size="${fontLabel}" font-weight="700" fill="#233c85" text-anchor="end">Restaurants p=${((1 - s) * L).toFixed(2)}</text>
    <text x="${fulcrumX}" y="${h - 10}" font-size="${fontCaption}" fill="#60605b" text-anchor="middle">price level L = ${L.toFixed(2)} (unchanged)</text>
  `, 'Seesaw showing the price structure between diners and restaurants');
}
