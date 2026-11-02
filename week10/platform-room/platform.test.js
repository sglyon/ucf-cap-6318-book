const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  Platform, fresh, fixedPoints, realizedAdoption, responseSlope, criticalMass, simulateTwoSided, WALK_A,
} = require('./platform');
const { createApp } = require('./server');

function setup(now = 1000) {
  let t = now;
  const g = new Platform(fresh(), () => {}, () => t);
  return { g, time: n => (t = n) };
}
function joinMany(g, n, prefix = 'P') {
  return Array.from({ length: n }, (_, i) => g.join(`${prefix}${i}`, undefined).token);
}

test('Lecture numbers: fixed points and critical mass at p = 0.2', () => {
  const g = n => realizedAdoption(n, 0.2, 0.1, 1.0);
  const [zero, nL, nH] = fixedPoints(g);
  assert.equal(zero, 0);
  assert.ok(Math.abs(nL - 0.1298) < 0.001, nL);
  assert.ok(Math.abs(nH - 0.7702) < 0.001, nH);
  assert.ok(Math.abs(responseSlope(nL, 0.2, 0.1, 1.0)) > 1, 'n_L is unstable');
  assert.ok(Math.abs(responseSlope(nH, 0.2, 0.1, 1.0)) < 1, 'n_H is stable');
  assert.ok(Math.abs(criticalMass(0.2, 0.1, 1.0) - nL) < 1e-4);
});
test('Critical mass shrinks as price falls', () => {
  const masses = [0.25, 0.2, 0.15, 0.1].map(p => criticalMass(p, 0.1, 1.0));
  for (let i = 1; i < masses.length; i++) assert.ok(masses[i] < masses[i - 1]);
});

test('Stratified dealing: exact quantile multiset, rebalances on late join', () => {
  const { g } = setup();
  const tokens = joinMany(g, 10);
  g.admin('start', { duration: 5 });
  const xs = g.s.players.map(p => p.x).sort((a, b) => a - b);
  const expected = Array.from({ length: 10 }, (_, k) => (k + 0.5) / 10);
  xs.forEach((x, i) => assert.ok(Math.abs(x - expected[i]) < 1e-9));
  g.admin('close');
  // A late joiner changes group membership; next start must redeal to size 11.
  g.join('Late', undefined);
  g.admin('start', { duration: 5 });
  const xs2 = g.s.players.filter(p => p.group === 'A').map(p => p.x).sort((a, b) => a - b);
  const expected2 = Array.from({ length: 11 }, (_, k) => (k + 0.5) / 11);
  assert.equal(xs2.length, 11);
  xs2.forEach((x, i) => assert.ok(Math.abs(x - expected2[i]) < 1e-9));
});

test('Round lifecycle: deadline, last-choice-wins, no-choice counts as stay out', () => {
  const { g, time } = setup();
  const [a, b, c] = joinMany(g, 3);
  g.admin('market', { market: 'A', p: 0.05, nE: 0.9 });
  g.admin('start', { duration: 10 });
  const roundId = g.s.round.id;
  g.choose(a, { roundId, choice: 'join' });
  g.choose(a, { roundId, choice: 'out' });
  g.choose(a, { roundId, choice: 'join' }); // last choice wins
  g.choose(b, { roundId, choice: 'out' });
  // c never chooses -> stays out
  assert.throws(() => g.choose(a, { roundId: 'stale', choice: 'join' }));
  time(20000);
  assert.throws(() => g.choose(b, { roundId, choice: 'join' }));
  g.expire();
  assert.equal(g.s.round.status, 'ended');
  assert.equal(g.s.walk.markets.A.history.length, 1);
  const entry = g.s.walk.markets.A.history[0];
  assert.equal(entry.joinCount, 1); // only a
  assert.ok(Math.abs(entry.nRealized - 1 / 3) < 1e-9);
});

test('Payoffs computed from realized share, not announced share', () => {
  const { g } = setup();
  const [a, b] = joinMany(g, 2);
  g.admin('market', { market: 'A', p: 0.2, nE: 0.9 }); // announced high, but only 1/2 join
  g.admin('start', { duration: 10 });
  const roundId = g.s.round.id;
  g.choose(a, { roundId, choice: 'join' });
  g.choose(b, { roundId, choice: 'out' });
  g.admin('close');
  const nRealized = 0.5;
  const xa = g.player(a).x;
  const expected = xa * (WALK_A.a + WALK_A.b * nRealized) - 0.2;
  assert.ok(Math.abs(g.player(a).score - expected) < 1e-9);
  assert.equal(g.player(b).score, 0);
  assert.equal(g.s.walk.markets.A.nE, nRealized); // announced n^e updates to realized share
});

test('Two markets are independent (own p, n^e, history, payoffs)', () => {
  const { g } = setup();
  g.admin('split', { twoMarket: true });
  const tokens = joinMany(g, 20);
  g.admin('market', { market: 'A', p: 0.05, nE: 0.9 });
  g.admin('market', { market: 'B', p: 0.5, nE: 0.1 });
  g.admin('start', { duration: 10 });
  const roundId = g.s.round.id;
  for (const t of tokens) g.choose(t, { roundId, choice: g.player(t).group === 'A' ? 'join' : 'out' });
  g.admin('close');
  assert.equal(g.s.walk.markets.A.history.length, 1);
  assert.equal(g.s.walk.markets.B.history.length, 1);
  const a = g.s.walk.markets.A.history[0], b = g.s.walk.markets.B.history[0];
  assert.notEqual(a.nRealized, b.nRealized);
  assert.equal(a.p, 0.05); assert.equal(b.p, 0.5);
  // No cross-market leakage in payoffs: B players who stayed out earn 0 regardless of A's outcome.
  for (const t of tokens) if (g.player(t).group === 'B') assert.equal(g.player(t).score, 0);
});

test('Volunteer adjustment shifts the realized count by at most one before settling', () => {
  const { g } = setup();
  const tokens = joinMany(g, 5);
  g.admin('market', { market: 'A', p: 0.5, nE: 0.5 });
  g.admin('start', { duration: 10 });
  const roundId = g.s.round.id;
  g.choose(tokens[0], { roundId, choice: 'join' });
  g.admin('volunteer', { market: 'A', delta: 1 });
  g.admin('close');
  const entry = g.s.walk.markets.A.history[0];
  assert.equal(entry.joinCount, 1); // raw joins
  assert.ok(Math.abs(entry.nRealized - 2 / 5) < 1e-9); // adjusted by +1 -> 2/5
  assert.throws(() => g.admin('volunteer', { market: 'A', delta: 1 })); // round already closed
});

test('Knife-edge: Set n^e = n_L for a market', () => {
  const { g } = setup();
  joinMany(g, 5);
  g.admin('market', { market: 'A', p: 0.2 });
  g.admin('knifeEdge', { market: 'A' });
  assert.ok(Math.abs(g.s.walk.markets.A.nE - 0.1298) < 0.001);
});

test('Two-sided calibration: free-for-diners / even / free-for-restaurants for N in {10,15,20,25,30}', () => {
  const paramsD = { a: 0.05, b: 0.3 }, paramsR = { a: 0.1, b: 3.0 };
  for (const N of [10, 15, 20, 25, 30]) {
    const fd = simulateTwoSided({ nDe: 0.1, nRe: 0.1, L: 0.4, s: 0, paramsD, paramsR, ND: N, NR: N, rounds: 12 });
    const even = simulateTwoSided({ nDe: 0.1, nRe: 0.1, L: 0.4, s: 0.5, paramsD, paramsR, ND: N, NR: N, rounds: 12 });
    const fr = simulateTwoSided({ nDe: 0.1, nRe: 0.1, L: 0.4, s: 1, paramsD, paramsR, ND: N, NR: N, rounds: 12 });
    const last = p => p[p.length - 1];
    assert.equal(last(fd).nDe, 1, `N=${N} free-diners nD`);
    assert.ok(last(fd).nRe >= 0.8, `N=${N} free-diners nR=${last(fd).nRe}`);
    assert.equal(last(even).nDe, 0, `N=${N} even nD`);
    assert.equal(last(even).nRe, 0, `N=${N} even nR`);
    assert.equal(last(fr).nDe, 0, `N=${N} free-restaurants nD`);
    assert.equal(last(fr).nRe, 1, `N=${N} free-restaurants nR`);
  }
});

test('Price-structure round: side-specific payoffs use the OTHER side realized share', () => {
  const { g } = setup();
  const tokens = joinMany(g, 20);
  g.admin('mode', { mode: 'price' });
  g.admin('priceParams', { L: 0.4, s: 0.5, nDe: 0.1, nRe: 0.1 });
  g.admin('start', { duration: 10 });
  const roundId = g.s.round.id;
  for (const t of tokens) g.choose(t, { roundId, choice: 'join' });
  g.admin('close');
  const entry = g.s.price.history[0];
  assert.ok(entry.nD > 0 && entry.nR > 0);
  assert.ok(Math.abs(entry.revenue - (entry.pD * entry.nD * entry.ND + entry.pR * entry.nR * entry.NR)) < 1e-9);
  assert.equal(g.s.price.nDe, entry.nD);
  assert.equal(g.s.price.nRe, entry.nR);
});

test('Player taste x never appears in public state (view without token, or with a different token)', () => {
  const { g } = setup();
  const [a, b] = joinMany(g, 2);
  g.admin('start', { duration: 10 });
  const pub = JSON.stringify(g.view());
  assert.ok(!pub.includes('"x":' + g.player(a).x));
  const viewA = g.view(a);
  assert.equal(viewA.me.x, g.player(a).x);
  const viewAasJson = JSON.stringify(g.view(a).players);
  assert.ok(!viewAasJson.includes('"x"'));
});

test('Admin private view exposes x; admin console players table reflects joined/not + score', () => {
  const { g } = setup();
  const [a] = joinMany(g, 3);
  g.admin('start', { duration: 10 });
  const roundId = g.s.round.id;
  g.choose(a, { roundId, choice: 'join' });
  const view = g.adminView();
  const row = view.playersPrivate.find(p => p.id === g.player(a).id);
  assert.equal(row.x, g.player(a).x);
  assert.equal(row.respondedThisRound, true);
  assert.equal(row.choice, 'join');
});

test('Persistence round-trip preserves players, markets, and history', () => {
  const { g } = setup();
  joinMany(g, 4);
  g.admin('market', { market: 'A', p: 0.1, nE: 0.5 });
  g.admin('start', { duration: 5 });
  g.admin('close');
  const saved = JSON.parse(JSON.stringify(g.s));
  const restored = new Platform(saved, () => {}, () => 999999);
  assert.equal(restored.s.players.length, 4);
  assert.equal(restored.s.walk.markets.A.history.length, 1);
  assert.equal(restored.view().walk.A.history.length, 1);
});

test('Reconnect keeps identity; typed-confirmation new session clears everyone', () => {
  const { g } = setup();
  const [a] = joinMany(g, 1);
  assert.equal(g.join('Different name', a).token, a);
  assert.equal(g.s.players.length, 1);
  assert.throws(() => g.admin('newSession', {}));
  g.admin('newSession', { confirm: 'NEW SESSION' });
  assert.equal(g.s.players.length, 0);
});

test('HTTP: admin auth, origin check, private views, SSE privacy, reconnect, restart settlement', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'platform-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const dataFile = path.join(dir, 'session.json');
  const app = createApp({ dataFile, adminKey: 'test' });
  await new Promise(r => app.server.listen(0, '127.0.0.1', r));
  t.after(() => app.server.close());
  const base = `http://127.0.0.1:${app.server.address().port}`;
  const post = async (p, b, token, origin) => {
    const headers = { 'content-type': 'application/json', authorization: `Bearer ${token || ''}` };
    if (origin !== undefined) headers.origin = origin;
    const r = await fetch(base + p, { method: 'POST', headers, body: JSON.stringify(b) });
    return { status: r.status, body: await r.json() };
  };
  assert.equal((await post('/api/admin/start', {})).status, 403);
  assert.equal((await post('/api/join', { name: 'Wrong Origin' }, undefined, 'http://evil.example')).status, 403);
  const a = (await post('/api/join', { name: 'A' })).body.token;
  const b = (await post('/api/join', { name: 'B' })).body.token;
  await post('/api/admin/market?key=test', { market: 'A', p: 0.2, nE: 0.9 });
  await post('/api/admin/start?key=test', { duration: 5 });
  const roundId = app.game.s.round.id;
  await post('/api/choose', { roundId, choice: 'join' }, a);
  await post('/api/choose', { roundId, choice: 'out' }, b);
  await post('/api/admin/close?key=test', {});
  const saved = JSON.parse(fs.readFileSync(dataFile));
  assert.equal(saved.walk.markets.A.history.length, 1);
  const publicView = await (await fetch(base + '/state')).json();
  assert.equal(publicView.me, null);
  assert.ok(!JSON.stringify(publicView).includes(a));
  assert.equal((await fetch(base + '/api/backup?key=wrong')).status, 403);
  const restored = createApp({ dataFile, adminKey: 'test' });
  restored.server.emit('close');
  assert.equal(restored.game.player(a).name, 'A');
  // Reconnect keeps identity.
  assert.equal((await post('/api/join', { name: 'ignored' }, a)).body.token, a);
  const stream = await fetch(base + '/events');
  const reader = stream.body.getReader();
  const event = new TextDecoder().decode((await reader.read()).value);
  assert.ok(!event.includes(a));
  await reader.cancel();
});
