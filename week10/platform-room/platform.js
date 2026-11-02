// Platform Room engine: "Walk the Line" (one-sided O1) and "Price Structure" (two-sided O3).
// Ported from week10/L10.01_platform_economics.ipynb (network_value, realized_adoption,
// fixed_points, response_slope, critical_mass). Mirrors week09/auction-room's Auction class shape.
const crypto = require('node:crypto');

function num(v, name, min = -Infinity, max = Infinity) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${name} must be a number from ${min} to ${max}.`);
  return n;
}
function integer(v, name, min = 0, max = 1000000) {
  if (!Number.isSafeInteger(Number(v)) || v < min || v > max) throw new Error(`${name} must be a whole number from ${min} to ${max}.`);
  return Number(v);
}

// --- Pure lecture math (ported from the notebook) -------------------------------------------
const networkValue = (n, a, b) => a + b * n;
const realizedAdoption = (nExpected, p, a, b) => {
  const value = networkValue(nExpected, a, b);
  const raw = 1 - p / value;
  return Math.min(1, Math.max(0, raw));
};
function bisectZero(h, left, right, tol = 1e-10, maxiter = 200) {
  let fLeft = h(left), fRight = h(right);
  if (Math.abs(fLeft) < tol) return left;
  if (Math.abs(fRight) < tol) return right;
  if (fLeft * fRight > 0) throw new Error('The interval does not bracket a root.');
  for (let i = 0; i < maxiter; i++) {
    const mid = (left + right) / 2, fMid = h(mid);
    if (Math.abs(fMid) < tol || right - left < tol) return mid;
    if (fLeft * fMid < 0) right = mid;
    else { left = mid; fLeft = fMid; }
  }
  return (left + right) / 2;
}
function fixedPoints(g, gridSize = 4000, tol = 1e-8) {
  const xs = Array.from({ length: gridSize + 1 }, (_, i) => i / gridSize);
  const gaps = xs.map(x => g(x) - x);
  const roots = [];
  for (let i = 0; i < xs.length; i++) if (Math.abs(gaps[i]) < tol) roots.push(xs[i]);
  for (let i = 0; i < xs.length - 1; i++) {
    if (gaps[i] * gaps[i + 1] < 0) roots.push(bisectZero(n => g(n) - n, xs[i], xs[i + 1]));
  }
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
function criticalMass(price, a, b) {
  const response = n => realizedAdoption(n, price, a, b);
  const roots = fixedPoints(response);
  const unstable = roots.filter(n => responseSlope(n, price, a, b) > 1 + 1e-6);
  return unstable.length ? Math.min(...unstable) : 0;
}

// --- Stratified, finite-N "rational play" (used for calibration tests and theory overlays) ---
// With x = (k - 0.5)/N for k = 1..N, a rational player joins iff x * f >= p. This is the
// exact finite-sample analogue of the lecture's continuous g(n^e; p) = clamp(1 - p/f, 0, 1).
function stratifiedShare(N, joinsAt) {
  if (N <= 0) return 0;
  let count = 0;
  for (let k = 1; k <= N; k++) if (joinsAt((k - 0.5) / N)) count++;
  return count / N;
}
function stratifiedRealizedAdoption(nExpected, p, a, b, N) {
  const f = networkValue(nExpected, a, b);
  return stratifiedShare(N, x => x * f >= p);
}
// One deterministic step of the two-sided game: diners/restaurants best-respond to the other
// side's announced (expected) share, using stratified tastes on each side.
function twoSidedStep(nDe, nRe, pD, pR, paramsD, paramsR, ND, NR) {
  const fD = networkValue(nRe, paramsD.a, paramsD.b);
  const fR = networkValue(nDe, paramsR.a, paramsR.b);
  return { nD: stratifiedShare(ND, x => x * fD >= pD), nR: stratifiedShare(NR, x => x * fR >= pR) };
}
function simulateTwoSided({ nDe, nRe, L, s, paramsD, paramsR, ND, NR, rounds }) {
  const pD = s * L, pR = (1 - s) * L;
  const path = [{ nDe, nRe }];
  for (let i = 0; i < rounds; i++) {
    const { nD, nR } = twoSidedStep(nDe, nRe, pD, pR, paramsD, paramsR, ND, NR);
    nDe = nD; nRe = nR;
    path.push({ nDe, nRe });
  }
  return path;
}

// --- Engine state -----------------------------------------------------------------------------
const WALK_A = { a: 0.1, b: 1.0 };
const fresh = () => ({
  version: 1,
  mode: 'walk', // 'walk' | 'price'
  players: [],
  lastDeal: {}, // { [group]: sorted player-id array recorded at last deal } -- triggers redeal on membership change
  roundCounter: 0,
  walk: {
    twoMarket: false,
    markets: {
      A: { p: 0.2, nE: 0.05, history: [] },
      B: { p: 0.2, nE: 0.9, history: [] },
    },
  },
  price: {
    L: 0.4, s: 0.5, nDe: 0.1, nRe: 0.1,
    paramsD: { a: 0.05, b: 0.3 },
    paramsR: { a: 0.1, b: 3.0 },
    history: [],
  },
  round: null,
  revealTheory: false,
});

class Platform {
  constructor(state = fresh(), save = () => {}, clock = Date.now) { this.s = state; this.save = save; this.clock = clock; }
  transaction(fn) {
    const before = structuredClone(this.s);
    try { const result = fn(); this.save(this.s); return result; }
    catch (e) { this.s = before; throw e; }
  }
  player(token) { return this.s.players.find(p => p.token === token); }
  playerById(id) { return this.s.players.find(p => p.id === id); }

  groupLabels(mode = this.s.mode) {
    if (mode === 'price') return ['D', 'R'];
    return this.s.walk.twoMarket ? ['A', 'B'] : ['A'];
  }
  assignGroups(labels) {
    const ids = this.s.players.map(p => p.id);
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    ids.forEach((id, idx) => { this.playerById(id).group = labels[idx % labels.length]; });
    this.s.lastDeal = {};
  }
  assignNewPlayerGroup() {
    const labels = this.groupLabels();
    if (labels.length === 1) return labels[0];
    const counts = labels.map(l => this.s.players.filter(p => p.group === l).length);
    if (counts[0] === counts[1]) return labels[Math.random() < 0.5 ? 0 : 1];
    return counts[0] < counts[1] ? labels[0] : labels[1];
  }
  dealGroup(label) {
    const ids = this.s.players.filter(p => p.group === label).map(p => p.id);
    const shuffled = [...ids];
    for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    const N = shuffled.length;
    shuffled.forEach((id, idx) => { this.playerById(id).x = (idx + 0.5) / N; });
    this.s.lastDeal[label] = [...ids].sort();
  }
  maybeDeal(force = false) {
    for (const label of this.groupLabels()) {
      const current = this.s.players.filter(p => p.group === label).map(p => p.id).sort();
      const last = this.s.lastDeal[label];
      if (force || !last || JSON.stringify(last) !== JSON.stringify(current)) {
        if (current.length) this.dealGroup(label);
        else this.s.lastDeal[label] = [];
      }
    }
  }

  join(name, token) {
    const existing = this.player(token);
    if (existing) return { token: existing.token };
    name = String(name || '').trim().slice(0, 30);
    if (!name) throw new Error('Enter a display name.');
    return this.transaction(() => {
      const p = {
        id: crypto.randomUUID(), token: crypto.randomBytes(24).toString('hex'), name,
        order: this.s.players.length, score: 0, group: null, x: 0.5, lastResult: null,
      };
      p.group = this.assignNewPlayerGroup();
      this.s.players.push(p);
      return { token: p.token };
    });
  }

  choose(token, b) {
    this.expire();
    return this.transaction(() => {
      const p = this.player(token);
      if (!p) throw new Error('Join again on this device.');
      const r = this.s.round;
      if (!r || r.id !== b.roundId || r.status !== 'running' || this.clock() >= r.endsAt) throw new Error('This round has closed or changed.');
      if (!this.playersInRound(r).some(x => x.id === p.id)) throw new Error('You are not part of this round.');
      if (!['join', 'out'].includes(b.choice)) throw new Error('Choice must be join or out.');
      r.choices[p.id] = b.choice;
      return { ok: true };
    });
  }
  playersInRound(r = this.s.round) {
    if (!r) return [];
    const labels = r.mode === 'walk' ? r.markets : ['D', 'R'];
    return this.s.players.filter(p => labels.includes(p.group));
  }

  expire() {
    if (this.s.round?.status === 'running' && this.clock() >= this.s.round.endsAt) this.transaction(() => this.settle('timer'));
  }
  settle(reason) {
    const r = this.s.round;
    if (!r || r.status !== 'running') return;
    r.status = 'ended'; r.closedAt = this.clock(); r.reason = reason;
    if (r.mode === 'walk') {
      const result = {};
      for (const m of r.markets) {
        const group = this.s.players.filter(p => p.group === m);
        const N = group.length;
        const joined = group.filter(p => r.choices[p.id] === 'join');
        const adj = r.volunteerAdj[m] || 0;
        const joinCount = Math.min(N, Math.max(0, joined.length + adj));
        const nRealized = N ? joinCount / N : 0;
        const { p: price, nE } = r.snapshot[m];
        const f = networkValue(nRealized, WALK_A.a, WALK_A.b);
        for (const pl of joined) {
          const earned = pl.x * f - price;
          pl.score += earned;
          pl.lastResult = { mode: 'walk', market: m, no: r.no, joined: true, n: nRealized, p: price, earned };
        }
        for (const pl of group) if (!joined.includes(pl)) pl.lastResult = { mode: 'walk', market: m, no: r.no, joined: false, n: nRealized, p: price, earned: 0 };
        const entry = { no: r.no, market: m, p: price, nE, nRealized, joinCount: joined.length, respondedCount: group.filter(p => r.choices[p.id] != null).length, N, volunteerAdj: adj };
        this.s.walk.markets[m].history.push(entry);
        this.s.walk.markets[m].nE = nRealized;
        result[m] = entry;
      }
      r.result = result;
    } else {
      const Dp = this.s.players.filter(p => p.group === 'D'), Rp = this.s.players.filter(p => p.group === 'R');
      const ND = Dp.length, NR = Rp.length;
      const joinedD = Dp.filter(p => r.choices[p.id] === 'join'), joinedR = Rp.filter(p => r.choices[p.id] === 'join');
      const nD = ND ? joinedD.length / ND : 0, nR = NR ? joinedR.length / NR : 0;
      const { L, s, pD, pR, nDe, nRe, paramsD, paramsR } = r.snapshot;
      const fD = networkValue(nR, paramsD.a, paramsD.b), fR = networkValue(nD, paramsR.a, paramsR.b);
      for (const pl of joinedD) { const earned = pl.x * fD - pD; pl.score += earned; pl.lastResult = { mode: 'price', side: 'D', no: r.no, joined: true, n: nD, other: nR, p: pD, earned }; }
      for (const pl of Dp) if (!joinedD.includes(pl)) pl.lastResult = { mode: 'price', side: 'D', no: r.no, joined: false, n: nD, other: nR, p: pD, earned: 0 };
      for (const pl of joinedR) { const earned = pl.x * fR - pR; pl.score += earned; pl.lastResult = { mode: 'price', side: 'R', no: r.no, joined: true, n: nR, other: nD, p: pR, earned }; }
      for (const pl of Rp) if (!joinedR.includes(pl)) pl.lastResult = { mode: 'price', side: 'R', no: r.no, joined: false, n: nR, other: nD, p: pR, earned: 0 };
      const revenue = pD * joinedD.length + pR * joinedR.length;
      const entry = { no: r.no, L, s, pD, pR, nDe, nRe, nD, nR, revenue, ND, NR, respondedD: Dp.filter(p => r.choices[p.id] != null).length, respondedR: Rp.filter(p => r.choices[p.id] != null).length };
      this.s.price.history.push(entry);
      this.s.price.nDe = nD; this.s.price.nRe = nR;
      r.result = entry;
    }
  }

  admin(action, b = {}) {
    this.expire();
    return this.transaction(() => {
      const s = this.s;
      const running = s.round?.status === 'running';
      if (action === 'mode') {
        if (running) throw new Error('Close the current round before switching modes.');
        if (!['walk', 'price'].includes(b.mode)) throw new Error('Unknown mode.');
        s.mode = b.mode;
        this.assignGroups(this.groupLabels());
      } else if (action === 'split') {
        if (running) throw new Error('Close the current round before changing markets.');
        if (s.mode !== 'walk') throw new Error('Market split only applies to Walk the Line.');
        s.walk.twoMarket = !!b.twoMarket;
        this.assignGroups(this.groupLabels());
      } else if (action === 'deal') {
        if (running) throw new Error('Cannot redeal tastes during a running round.');
        this.maybeDeal(true);
      } else if (action === 'market') {
        if (running) throw new Error('Close the current round before changing a market.');
        const m = s.walk.markets[b.market];
        if (!m) throw new Error('Unknown market.');
        if (b.p !== undefined) m.p = num(b.p, 'Price', 0, 10);
        if (b.nE !== undefined) m.nE = num(b.nE, 'Expected adoption', 0, 1);
      } else if (action === 'knifeEdge') {
        if (running) throw new Error('Close the current round before changing a market.');
        const m = s.walk.markets[b.market];
        if (!m) throw new Error('Unknown market.');
        m.nE = criticalMass(m.p, WALK_A.a, WALK_A.b);
      } else if (action === 'priceParams') {
        if (running) throw new Error('Close the current round before changing prices.');
        const pr = s.price;
        if (b.L !== undefined) pr.L = num(b.L, 'Price level', 0, 10);
        if (b.s !== undefined) pr.s = num(b.s, 'Structure', 0, 1);
        if (b.nDe !== undefined) pr.nDe = num(b.nDe, 'Expected diner share', 0, 1);
        if (b.nRe !== undefined) pr.nRe = num(b.nRe, 'Expected restaurant share', 0, 1);
        if (b.paramsD) { if (b.paramsD.a !== undefined) pr.paramsD.a = num(b.paramsD.a, 'a_D', 0, 10); if (b.paramsD.b !== undefined) pr.paramsD.b = num(b.paramsD.b, 'b_D', 0, 10); }
        if (b.paramsR) { if (b.paramsR.a !== undefined) pr.paramsR.a = num(b.paramsR.a, 'a_R', 0, 10); if (b.paramsR.b !== undefined) pr.paramsR.b = num(b.paramsR.b, 'b_R', 0, 10); }
      } else if (action === 'preset') {
        if (running) throw new Error('Close the current round before changing prices.');
        const presets = { 'free-diners': 0, even: 0.5, 'free-restaurants': 1 };
        if (!(b.name in presets)) throw new Error('Unknown preset.');
        s.price.s = presets[b.name];
      } else if (action === 'start') {
        if (running) throw new Error('Close the current round first.');
        if (!s.players.length) throw new Error('Wait for at least one player to join.');
        const duration = integer(b.duration ?? 25, 'Duration', 5, 120);
        this.maybeDeal();
        const now = this.clock();
        if (s.mode === 'walk') {
          const markets = s.walk.twoMarket ? ['A', 'B'] : ['A'];
          const snapshot = {};
          for (const m of markets) snapshot[m] = { p: s.walk.markets[m].p, nE: s.walk.markets[m].nE };
          s.roundCounter += 1;
          s.round = { id: crypto.randomUUID(), mode: 'walk', no: s.roundCounter, status: 'running', startedAt: now, endsAt: now + duration * 1000, duration, markets, choices: {}, volunteerAdj: {}, snapshot };
        } else {
          const pr = s.price;
          const snapshot = { L: pr.L, s: pr.s, pD: pr.s * pr.L, pR: (1 - pr.s) * pr.L, nDe: pr.nDe, nRe: pr.nRe, paramsD: { ...pr.paramsD }, paramsR: { ...pr.paramsR } };
          s.roundCounter += 1;
          s.round = { id: crypto.randomUUID(), mode: 'price', no: s.roundCounter, status: 'running', startedAt: now, endsAt: now + duration * 1000, duration, choices: {}, snapshot };
        }
      } else if (action === 'close') {
        this.settle('instructor');
      } else if (action === 'volunteer') {
        if (!running || s.round.mode !== 'walk') throw new Error('Volunteer adjustment only applies during a running Walk the Line round.');
        if (!s.round.markets.includes(b.market)) throw new Error('That market is not active this round.');
        const delta = integer(b.delta, 'Volunteer delta', -1, 1);
        s.round.volunteerAdj[b.market] = delta;
      } else if (action === 'reveal') {
        s.revealTheory = !!b.on;
      } else if (action === 'resetHistory') {
        if (running) throw new Error('Close the current round before resetting history.');
        s.walk.markets.A.history = []; s.walk.markets.B.history = [];
        s.price.history = [];
        s.round = null; s.revealTheory = false; s.roundCounter = 0; s.lastDeal = {};
        for (const p of s.players) { p.score = 0; p.lastResult = null; }
      } else if (action === 'newSession') {
        if (running) throw new Error('Close the current round before starting a new session.');
        if (b.confirm !== 'NEW SESSION') throw new Error('Type NEW SESSION to reset players, history, and settings.');
        s.walk = fresh().walk; s.price = fresh().price;
        Object.assign(s, { players: [], lastDeal: {}, roundCounter: 0, round: null, revealTheory: false, mode: 'walk' });
      } else throw new Error('Unknown instructor action.');
      return { ok: true };
    });
  }

  marketView(m) {
    const market = this.s.walk.markets[m];
    return { p: market.p, nE: market.nE, history: market.history };
  }
  view(token) {
    this.expire();
    const s = this.s;
    const p = this.player(token);
    const groupsOf = label => s.players.filter(pl => pl.group === label);
    let round = null;
    if (s.round) {
      const r = s.round;
      if (r.mode === 'walk') {
        round = {
          id: r.id, mode: 'walk', no: r.no, status: r.status, startedAt: r.startedAt, endsAt: r.endsAt, duration: r.duration,
          markets: r.markets.map(m => ({
            market: m, p: r.snapshot[m].p, nE: r.snapshot[m].nE, N: groupsOf(m).length,
            responded: Object.keys(r.choices).filter(id => this.playerById(id)?.group === m).length,
            volunteerAdj: r.volunteerAdj[m] || 0,
            result: r.status === 'ended' ? r.result[m] : null,
          })),
        };
      } else {
        round = {
          id: r.id, mode: 'price', no: r.no, status: r.status, startedAt: r.startedAt, endsAt: r.endsAt, duration: r.duration,
          L: r.snapshot.L, s: r.snapshot.s, pD: r.snapshot.pD, pR: r.snapshot.pR, nDe: r.snapshot.nDe, nRe: r.snapshot.nRe,
          ND: groupsOf('D').length, NR: groupsOf('R').length,
          respondedD: Object.keys(r.choices).filter(id => this.playerById(id)?.group === 'D').length,
          respondedR: Object.keys(r.choices).filter(id => this.playerById(id)?.group === 'R').length,
          result: r.status === 'ended' ? r.result : null,
        };
      }
    }
    const leaderboard = [...s.players].sort((a, b) => b.score - a.score).slice(0, 10).map(({ id, name, score, group }) => ({ id, name, score, group }));
    const me = p ? { id: p.id, name: p.name, group: p.group, score: p.score, x: p.x, lastResult: p.lastResult, choice: s.round ? (s.round.choices[p.id] ?? null) : null } : null;
    return {
      serverTime: this.clock(), mode: s.mode, revealTheory: s.revealTheory, twoMarket: s.walk.twoMarket,
      walk: { A: this.marketView('A'), B: this.marketView('B') },
      price: { L: s.price.L, s: s.price.s, nDe: s.price.nDe, nRe: s.price.nRe, paramsD: s.price.paramsD, paramsR: s.price.paramsR, history: s.price.history },
      players: s.players.map(({ id, name, group, score }) => ({ id, name, group, score })),
      leaderboard, round, me,
    };
  }
  adminView() {
    const pub = this.view(null);
    pub.playersPrivate = this.s.players.map(p => ({
      id: p.id, name: p.name, group: p.group, score: p.score, x: p.x,
      respondedThisRound: this.s.round ? this.s.round.choices[p.id] != null : false,
      choice: this.s.round ? (this.s.round.choices[p.id] ?? null) : null,
    }));
    return pub;
  }
}

module.exports = {
  Platform, fresh,
  networkValue, realizedAdoption, fixedPoints, responseSlope, criticalMass,
  stratifiedShare, stratifiedRealizedAdoption, twoSidedStep, simulateTwoSided,
  WALK_A,
};
