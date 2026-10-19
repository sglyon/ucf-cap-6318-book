// Shared client helpers: live state stream and the network drawing.

const COLORS = { Red: "#e5484d", Blue: "#3e8ef7", Green: "#30a46c", Gold: "#e0a100", Purple: "#8e4ec6", Orange: "#f76b15", Teal: "#12a594", Pink: "#d6409f", Gray: "#8b8d98", Lime: "#7cb518", Navy: "#2f4bb0", Brown: "#a1715a" };

// Live state via Server-Sent Events, falling back to polling when SSE is blocked
// (e.g. Cloudflare quick tunnels don't support SSE). Add ?poll to force polling.
function connect(onState) {
  let polling = new URLSearchParams(location.search).has("poll");
  const poll = async () => {
    try { onState(await (await fetch("/state", { cache: "no-store" })).json()); } catch {}
    setTimeout(poll, 500);
  };
  if (polling) return poll();
  let gotMessage = false, failures = 0;
  const open = () => {
    const es = new EventSource("/events");
    es.onmessage = (e) => { gotMessage = true; failures = 0; onState(JSON.parse(e.data)); };
    es.onerror = () => {
      es.close();
      if (!gotMessage || ++failures >= 3) { if (!polling) { polling = true; poll(); } return; }
      setTimeout(open, 1500);
    };
  };
  open();
  // If the stream never delivers anything, assume a proxy is buffering it.
  setTimeout(() => { if (!gotMessage && !polling) { polling = true; poll(); } }, 4000);
}

function post(url, data) {
  return fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data || {}) }).then((r) => r.json());
}

const fmt = (x, d = 1) => (x === null || x === undefined || !Number.isFinite(x) ? "–" : x.toFixed(d));

// Draw the Braess network into an <svg>. Layout follows the notebook:
// A left, B right, D top, C bottom. `edges` comes from the server's live state.
function drawNetwork(svg, edges, wormhole, opts = {}) {
  const W = 600, H = 340;
  const N = { A: [70, 170], B: [530, 170], D: [300, 45], C: [300, 295] };
  const e = edges || { AC: 0, CB: 45, AD: 45, DB: 0, CD: 0, flowAC: 0, flowCB: 0, flowAD: 0, flowDB: 0, flowCD: 0 };
  const showFlows = opts.showFlows !== false;
  const list = [
    ["A", "D", e.AD, e.flowAD, "45"],
    ["D", "B", e.DB, e.flowDB, "40·x"],
    ["A", "C", e.AC, e.flowAC, "40·x"],
    ["C", "B", e.CB, e.flowCB, "45"],
  ];
  if (wormhole) list.push(["C", "D", 0, e.flowCD, "0"]);
  const line = ([a, b, t, f, label]) => {
    const [x1, y1] = N[a], [x2, y2] = N[b];
    const w = showFlows ? 3 + 34 * (f || 0) : 4;
    const isWorm = a === "C" && b === "D";
    const stroke = isWorm ? "var(--worm)" : "var(--road)";
    const [lx, ly] = { AD: [140, 66], DB: [460, 66], AC: [140, 284], CB: [460, 284], CD: [360, 172] }[a + b];
    const minutes = showFlows ? `${fmt(t, 1)} min` : label;
    const pct = showFlows ? `${Math.round((f || 0) * 100)}%` : "";
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" ${isWorm ? 'stroke-dasharray="2 10"' : ""} opacity="0.9"/>
      <text x="${lx}" y="${ly - 6}" text-anchor="middle" class="elabel">${minutes}</text>
      <text x="${lx}" y="${ly + 14}" text-anchor="middle" class="esub">${showFlows ? pct + " of cars" : label}</text>`;
  };
  const node = (k) => `<circle cx="${N[k][0]}" cy="${N[k][1]}" r="22" class="node"/><text x="${N[k][0]}" y="${N[k][1] + 7}" text-anchor="middle" class="nlabel">${k}</text>`;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.innerHTML = list.map(line).join("") + ["A", "B", "C", "D"].map(node).join("");
}

// Simple time-series chart on a canvas: class average commute with benchmark lines.
function drawSeries(canvas, round) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  const css = getComputedStyle(document.documentElement);
  const fg = css.getPropertyValue("--muted").trim(), line = css.getPropertyValue("--accent").trim();
  const lo = 60, hi = 90, pad = { l: 36, r: 110, t: 10, b: 22 };
  const X = (t) => pad.l + (t / (round ? round.duration : 90)) * (w - pad.l - pad.r);
  const Y = (v) => pad.t + (1 - (Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * (h - pad.t - pad.b);
  ctx.font = "12px system-ui"; ctx.fillStyle = fg; ctx.strokeStyle = fg; ctx.globalAlpha = 0.35;
  for (let v = lo; v <= hi; v += 5) { ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(w - pad.r, Y(v)); ctx.stroke(); }
  ctx.globalAlpha = 1;
  for (let v = lo; v <= hi; v += 5) ctx.fillText(v, 6, Y(v) + 4);
  if (!round) return;
  // Half-time marker: scoring starts here.
  ctx.setLineDash([2, 4]); ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(X(round.duration / 2), pad.t); ctx.lineTo(X(round.duration / 2), h - pad.b); ctx.stroke();
  ctx.globalAlpha = 1; ctx.fillText("scoring", X(round.duration / 2) + 4, h - 6);
  const bm = round.benchmark;
  const marks = [
    [bm.selfish, "all selfish", css.getPropertyValue("--bad").trim()],
    [bm.ne, "equilibrium", css.getPropertyValue("--warn").trim()],
    [bm.planner, "planner", css.getPropertyValue("--good").trim()],
  ];
  let lastY = -100;
  for (const [v, label, c] of marks.sort((a, b) => b[0] - a[0])) {
    ctx.strokeStyle = c; ctx.fillStyle = c; ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(w - pad.r, Y(v)); ctx.stroke();
    const ty = Math.max(Y(v) + 4, lastY + 14); lastY = ty;
    ctx.fillText(`${label} ${v.toFixed(1)}`, w - pad.r + 6, ty);
  }
  ctx.setLineDash([]); ctx.strokeStyle = line; ctx.lineWidth = 3;
  ctx.beginPath();
  round.series.forEach((p, i) => (i ? ctx.lineTo(X(p.t), Y(p.avg)) : ctx.moveTo(X(p.t), Y(p.avg))));
  ctx.stroke();
}

const BASE_CSS = `
:root { --bg:#f7f7f5; --card:#fff; --fg:#1b1b18; --muted:#6b6b66; --line:#e2e2dc; --accent:#3e63dd; --road:#3e63dd; --worm:#d6409f; --good:#30a46c; --warn:#e0a100; --bad:#e5484d; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#111113; --card:#1b1b1f; --fg:#ededef; --muted:#9b9ba3; --line:#2e2e35; --accent:#7b9cff; --road:#7b9cff; --worm:#f06cc1; } }
:root[data-theme="dark"] { --bg:#111113; --card:#1b1b1f; --fg:#ededef; --muted:#9b9ba3; --line:#2e2e35; --accent:#7b9cff; --road:#7b9cff; --worm:#f06cc1; }
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.4 system-ui, -apple-system, Segoe UI, sans-serif; }
.card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:16px; }
.muted { color:var(--muted); }
button { font:inherit; padding:10px 16px; border-radius:10px; border:1px solid var(--line); background:var(--card); color:var(--fg); cursor:pointer; }
button.primary { background:var(--accent); color:#fff; border-color:transparent; }
input, select { font:inherit; padding:8px 10px; border-radius:8px; border:1px solid var(--line); background:var(--card); color:var(--fg); }
svg .node { fill:var(--card); stroke:var(--fg); stroke-width:2; }
svg .nlabel { fill:var(--fg); font:700 20px system-ui; }
svg .elabel { fill:var(--fg); font:600 16px system-ui; }
svg .esub { fill:var(--muted); font:13px system-ui; }
.swatch { display:inline-block; width:12px; height:12px; border-radius:3px; margin-right:6px; vertical-align:-1px; }
`;
document.head.insertAdjacentHTML("beforeend", `<style>${BASE_CSS}</style>`);
