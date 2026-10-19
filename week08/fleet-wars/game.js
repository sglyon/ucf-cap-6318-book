// Fleet Wars game model: the Braess network from L08.02.
//
// Paths (all from A to B):
//   U = A-C-B   (variable A-C, fixed C-B)
//   L = A-D-B   (fixed A-D, variable D-B)
//   Z = A-C-D-B (variable A-C, wormhole C-D, variable D-B)
// Flows are fractions of the total fleet (all players' cars sum to 1).
// Variable edges cost 40 * flow; fixed edges cost 45; the wormhole costs 0.

const VAR = 40;
const FIX = 45;

function pathTimes(flow, wormhole) {
  const ac = flow[0] + flow[2];
  const db = flow[1] + flow[2];
  return [VAR * ac + FIX, FIX + VAR * db, wormhole ? VAR * ac + VAR * db : Infinity];
}

function edgeTimes(flow) {
  const ac = flow[0] + flow[2];
  const db = flow[1] + flow[2];
  return { AC: VAR * ac, CB: FIX, AD: FIX, DB: VAR * db, CD: 0, flowAC: ac, flowDB: db, flowCB: flow[0], flowAD: flow[1], flowCD: flow[2] };
}

// Normalize a raw [u, l, z] slider triple into shares that sum to 1.
function normalizeSplit(raw, wormhole) {
  let [u, l, z] = raw.map((v) => Math.max(0, Number(v) || 0));
  if (!wormhole) z = 0;
  const s = u + l + z;
  if (s <= 0) return wormhole ? [1 / 3, 1 / 3, 1 / 3] : [0.5, 0.5, 0];
  return [u / s, l / s, z / s];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + (a[2] ? a[2] * b[2] : 0);
}

// Simplex grid used for best-response search.
function simplexGrid(step, wormhole) {
  const pts = [];
  const n = Math.round(1 / step);
  for (let i = 0; i <= n; i++) {
    if (!wormhole) { pts.push([i / n, 1 - i / n, 0]); continue; }
    for (let j = 0; j <= n - i; j++) pts.push([i / n, j / n, (n - i - j) / n]);
  }
  return pts;
}

// Nash equilibrium among firms with the given masses (summing to 1), each
// minimizing its own fleet's total travel time. Damped best-response iteration.
// Returns aggregate flow and average commute.
function firmEquilibrium(masses, wormhole, iters = 400) {
  const grid = simplexGrid(wormhole ? 0.01 : 0.002, wormhole);
  let splits = masses.map(() => (wormhole ? [1 / 3, 1 / 3, 1 / 3] : [0.5, 0.5, 0]));
  const agg = () => {
    const f = [0, 0, 0];
    splits.forEach((s, i) => { for (let p = 0; p < 3; p++) f[p] += masses[i] * s[p]; });
    return f;
  };
  for (let it = 0; it < iters; it++) {
    const damp = 0.5 / (1 + it / 50);
    for (let i = 0; i < masses.length; i++) {
      const total = agg();
      const others = total.map((v, p) => v - masses[i] * splits[i][p]);
      let best = null;
      let bestCost = Infinity;
      for (const g of grid) {
        const f = [others[0] + masses[i] * g[0], others[1] + masses[i] * g[1], others[2] + masses[i] * g[2]];
        const t = pathTimes(f, wormhole);
        const c = g[0] * t[0] + g[1] * t[1] + (wormhole ? g[2] * t[2] : 0);
        if (c < bestCost) { bestCost = c; best = g; }
      }
      splits[i] = splits[i].map((v, p) => (1 - damp) * v + damp * best[p]);
    }
  }
  const flow = agg();
  const t = pathTimes(flow, wormhole);
  const avg = flow[0] * t[0] + flow[1] * t[1] + (wormhole ? flow[2] * t[2] : 0);
  return { flow, avg };
}

// Closed-form benchmarks.
// Social optimum with wormhole: avg cost 65 - 5z + 20z^2, minimized at z = 1/8.
const PLANNER = { on: 65 - 5 / 8 + 20 / 64, off: 65 };
const SELFISH = { on: 80, off: 65 };

module.exports = { pathTimes, edgeTimes, normalizeSplit, firmEquilibrium, dot, PLANNER, SELFISH };
