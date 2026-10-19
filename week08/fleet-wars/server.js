// Fleet Wars: a live Braess-network routing game for the classroom.
// Zero dependencies. Run: ADMIN_KEY=secret node server.js   (PORT defaults to 3000)
//
//   /         player view (phones)
//   /screen   projector view
//   /admin?key=...  instructor console

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const G = require("./game.js");
const createWarmup = require("./warmup.js");

const PORT = Number(process.env.PORT || 3000);
const ADMIN_KEY = process.env.ADMIN_KEY || "fleet";
// Public join URL shown on the projector (e.g. your tunnel URL). Defaults to whatever origin /screen was opened from.
const PUBLIC_URL = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
const TICK_MS = 500;
const COMPANY_NAMES = ["Red", "Blue", "Green", "Gold", "Purple", "Orange", "Teal", "Pink", "Gray", "Lime", "Navy", "Brown"];

// ---------------------------------------------------------------- state

const players = new Map(); // id -> {id, name, raw:[u,l,z], company, lastSeen}
const W = createWarmup(players);
let activity = "fleet"; // "fleet" | "warmup": what phones and the projector show
let config = { companies: 0, wormhole: false, duration: 90, info: "full" }; // companies 0 = everyone solo
let round = null; // current/last round
let roundNo = 0;
const history = []; // finished round summaries
const tickLog = []; // [{round, t, playerId, name, company, u, l, z, commute}]

function newRound() {
  const active = [...players.values()];
  const n = active.length;
  if (!n) return { error: "No players have joined yet." };
  const k = config.companies <= 0 ? n : Math.min(config.companies, n);
  // Random balanced assignment.
  const shuffled = active.slice().sort(() => Math.random() - 0.5);
  const companies = [];
  for (let c = 0; c < k; c++) companies.push({ id: c, name: k === n && config.companies <= 0 ? null : COMPANY_NAMES[c % COMPANY_NAMES.length], members: [] });
  shuffled.forEach((p, i) => { const c = companies[i % k]; c.members.push(p.id); p.company = c.id; });
  companies.forEach((c) => { if (!c.name) c.name = players.get(c.members[0]).name; });

  const masses = companies.map((c) => c.members.length / n);
  const ne = G.firmEquilibrium(masses, config.wormhole);
  roundNo += 1;
  const now = Date.now();
  round = {
    no: roundNo,
    status: "running",
    wormhole: config.wormhole,
    info: config.info,
    duration: config.duration,
    startedAt: now,
    endsAt: now + config.duration * 1000,
    companies,
    benchmark: {
      ne: ne.avg,
      neFlow: ne.flow,
      planner: config.wormhole ? G.PLANNER.on : G.PLANNER.off,
      selfish: config.wormhole ? G.SELFISH.on : G.SELFISH.off,
    },
    series: [], // [{t, avg}]
    acc: {}, // company id -> {sum, n} over scoring window
    live: null,
  };
  for (const p of active) p.raw = config.wormhole ? [50, 50, 50] : [50, 50, 0];
  return { ok: true };
}

function compute() {
  const wormhole = round ? round.wormhole : config.wormhole;
  // During a round only the players assigned to a company are on the road.
  const roster = round ? round.companies.flatMap((c) => c.members).map((id) => players.get(id)).filter(Boolean) : [...players.values()];
  const n = roster.length;
  const per = [];
  const flow = [0, 0, 0];
  for (const p of roster) {
    const s = G.normalizeSplit(p.raw || [1, 1, 1], wormhole);
    per.push({ p, s });
    for (let i = 0; i < 3; i++) flow[i] += s[i] / Math.max(n, 1);
  }
  const t = G.pathTimes(flow, wormhole);
  const edges = G.edgeTimes(flow);
  const commute = {};
  for (const { p, s } of per) commute[p.id] = s[0] * t[0] + s[1] * t[1] + (wormhole ? s[2] * t[2] : 0);
  const companies = (round ? round.companies : []).map((c) => {
    const vals = c.members.filter((id) => commute[id] !== undefined).map((id) => commute[id]);
    return { id: c.id, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null };
  });
  const avg = per.length ? Object.values(commute).reduce((a, b) => a + b, 0) / per.length : null;
  return { flow, times: t.map((x) => (Number.isFinite(x) ? x : null)), edges, commute, companies, avg, splits: Object.fromEntries(per.map(({ p, s }) => [p.id, s])) };
}

function tick() {
  if (!round || round.status !== "running") return;
  const now = Date.now();
  const live = compute();
  round.live = live;
  const t = (now - round.startedAt) / 1000;
  round.series.push({ t, avg: live.avg });
  // Score on the second half of the round: early flailing doesn't count.
  if (t >= round.duration / 2) {
    for (const c of live.companies) {
      if (c.avg === null) continue;
      const a = (round.acc[c.id] ||= { sum: 0, n: 0 });
      a.sum += c.avg; a.n += 1;
    }
  }
  for (const p of players.values()) {
    const s = live.splits[p.id];
    if (!s) continue;
    tickLog.push({ round: round.no, t: t.toFixed(1), playerId: p.id, name: p.name, company: round.companies[p.company]?.name ?? "", wormhole: round.wormhole ? 1 : 0, u: s[0].toFixed(4), l: s[1].toFixed(4), z: s[2].toFixed(4), commute: live.commute[p.id].toFixed(3) });
  }
  if (now >= round.endsAt) endRound();
  broadcast();
}

function endRound() {
  if (!round || round.status !== "running") return;
  round.status = "ended";
  const last = round.series.slice(Math.floor(round.series.length / 2));
  const realized = last.length ? last.reduce((a, b) => a + b.avg, 0) / last.length : null;
  const scores = round.companies.map((c) => {
    const a = round.acc[c.id];
    return { company: c.name, size: c.members.length, members: c.members.map((id) => players.get(id)?.name), score: a && a.n ? a.sum / a.n : null };
  }).sort((a, b) => (a.score ?? 1e9) - (b.score ?? 1e9));
  // A round stopped before the scoring window has no scores: drop it so history and round numbers stay clean.
  if (scores.every((s) => s.score === null)) {
    round.discarded = true;
    roundNo -= 1;
    for (let i = tickLog.length - 1; i >= 0; i--) if (tickLog[i].round === round.no) tickLog.splice(i, 1);
    return;
  }
  history.push({ no: round.no, companies: round.companies.length, players: round.companies.reduce((a, c) => a + c.members.length, 0), wormhole: round.wormhole, realized, ...round.benchmark, scores });
}

// ---------------------------------------------------------------- views

function publicState() {
  return {
    activity,
    warmup: W.publicState(),
    config,
    publicUrl: PUBLIC_URL,
    serverTime: Date.now(),
    players: [...players.values()].map((p) => ({ id: p.id, name: p.name, company: p.company, raw: p.raw })),
    round: round && {
      no: round.no, status: round.status, wormhole: round.wormhole, info: round.info, duration: round.duration,
      startedAt: round.startedAt, endsAt: round.endsAt, benchmark: round.benchmark,
      companies: round.companies, series: round.series, live: round.live,
    },
    history,
  };
}

// ---------------------------------------------------------------- SSE

const clients = new Set();
function broadcast() {
  const data = `data: ${JSON.stringify(publicState())}\n\n`;
  for (const res of clients) res.write(data);
}
setInterval(tick, TICK_MS);
setInterval(() => { for (const res of clients) res.write(": ping\n\n"); }, 15000);

// ---------------------------------------------------------------- HTTP

function body(req) {
  return new Promise((resolve) => {
    let b = "";
    req.on("data", (c) => (b += c));
    req.on("end", () => {
      try { const v = JSON.parse(b || "{}"); resolve(v && typeof v === "object" && !Array.isArray(v) ? v : {}); } catch { resolve({}); }
    });
  });
}
function json(res, code, obj) { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); }
function sendFile(res, file, type) {
  fs.readFile(path.join(__dirname, "public", file), (err, buf) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "content-type": type, "cache-control": "no-store" }); res.end(buf);
  });
}
function csv(rows) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v) => { const s = Array.isArray(v) ? v.join("; ") : String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

const server = http.createServer(async (req, res) => {
  let url;
  try { url = new URL(req.url, "http://x"); } catch { res.writeHead(400); return res.end("bad request"); }
  const p = url.pathname;
  const isAdmin = url.searchParams.get("key") === ADMIN_KEY;

  if (p === "/" || p === "/play") return sendFile(res, "play.html", "text/html");
  if (p === "/screen") return sendFile(res, "screen.html", "text/html");
  if (p === "/admin") return sendFile(res, "admin.html", "text/html");
  if (p === "/common.js") return sendFile(res, "common.js", "text/javascript");
  if (p === "/warmup-ui.js") return sendFile(res, "warmup-ui.js", "text/javascript");
  if (p === "/qrcode.js") return sendFile(res, "qrcode.js", "text/javascript");

  if (p === "/state") return json(res, 200, publicState());

  if (p === "/events") {
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive", "x-accel-buffering": "no" });
    res.write(`data: ${JSON.stringify(publicState())}\n\n`);
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  if (req.method === "POST" && p === "/api/join") {
    const b = await body(req);
    const name = String(b.name || "").replace(/[<>&"'`]/g, "").trim().slice(0, 20);
    if (!name) return json(res, 400, { error: "Pick a name" });
    let pl = b.id && players.get(b.id);
    if (!pl) { pl = { id: crypto.randomBytes(6).toString("hex"), raw: [50, 50, 0], company: null }; players.set(pl.id, pl); }
    pl.name = name;
    broadcast();
    return json(res, 200, { id: pl.id });
  }
  if (req.method === "POST" && p === "/api/split") {
    const b = await body(req);
    const pl = players.get(b.id);
    if (!pl) return json(res, 404, { error: "unknown player" });
    if (Array.isArray(b.raw) && b.raw.length === 3) pl.raw = b.raw.map((v) => Math.max(0, Math.min(100, Number(v) || 0)));
    return json(res, 200, { ok: true });
  }

  if (req.method === "POST" && p === "/api/w/submit") {
    const b = await body(req);
    if (!players.has(b.id)) return json(res, 404, { error: "unknown player" });
    const r = W.submit(b.id, b.value);
    broadcast();
    return json(res, r.error ? 400 : 200, r);
  }

  if (p.startsWith("/api/admin/")) {
    if (!isAdmin) return json(res, 403, { error: "bad key" });
    const b = req.method === "POST" ? await body(req) : {};
    const action = p.slice("/api/admin/".length);
    if (action === "config") {
      if (b.companies !== undefined) config.companies = Math.max(0, Math.floor(Number(b.companies) || 0));
      if (b.wormhole !== undefined) {
        config.wormhole = !!b.wormhole;
        // Opening or closing the wormhole mid-round takes effect immediately.
        if (round && round.status === "running" && round.wormhole !== config.wormhole) {
          round.wormhole = config.wormhole;
          const total = round.companies.reduce((a, c) => a + c.members.length, 0);
          const masses = round.companies.map((c) => c.members.length / Math.max(total, 1));
          const ne = G.firmEquilibrium(masses, round.wormhole);
          round.benchmark = { ne: ne.avg, neFlow: ne.flow, planner: round.wormhole ? G.PLANNER.on : G.PLANNER.off, selfish: round.wormhole ? G.SELFISH.on : G.SELFISH.off };
          round.acc = {};
        }
      }
      if (b.duration !== undefined) config.duration = Math.max(10, Math.min(600, Number(b.duration) || 90));
      if (b.info !== undefined) config.info = b.info === "own" ? "own" : "full";
      broadcast();
      return json(res, 200, config);
    }
    if (action === "start") {
      activity = "fleet";
      if (round && round.status === "running") endRound();
      const r = newRound();
      broadcast();
      return json(res, r.error ? 400 : 200, r);
    }
    if (action === "stop") { endRound(); broadcast(); return json(res, 200, { ok: true }); }
    if (action === "activity") { activity = b.activity === "warmup" ? "warmup" : "fleet"; broadcast(); return json(res, 200, { activity }); }
    if (action === "w/mode") { W.setMode(b.mode, b.game); activity = "warmup"; broadcast(); return json(res, 200, { ok: true }); }
    if (action === "w/start") {
      if (round && round.status === "running") endRound(); // don't leave a Fleet Wars round scoring in the background
      activity = "warmup"; const r = W.start(); broadcast(); return json(res, r.error ? 400 : 200, r); }
    if (action === "w/reveal") { W.reveal(); broadcast(); return json(res, 200, { ok: true }); }
    if (action === "w/reset") { W.reset(); broadcast(); return json(res, 200, { ok: true }); }
    if (action === "kick") {
      players.delete(b.id);
      // Drop them from the running round too, so they stop counting as traffic or team size.
      if (round) for (const c of round.companies) c.members = c.members.filter((m) => m !== b.id);
      W.drop(b.id);
      broadcast();
      return json(res, 200, { ok: true });
    }
    if (action === "reset") {
      round = null; roundNo = 0; history.length = 0; tickLog.length = 0;
      if (b.players) { players.clear(); W.reset(); }
      broadcast();
      return json(res, 200, { ok: true });
    }
  }

  if (p === "/export/warmups.csv") {
    if (!isAdmin) { res.writeHead(403); return res.end("bad key"); }
    res.writeHead(200, { "content-type": "text/csv", "content-disposition": "attachment; filename=warmups.csv" });
    return res.end(csv(W.exportRows()));
  }

  if (p === "/export/rounds.csv" || p === "/export/ticks.csv") {
    if (!isAdmin) { res.writeHead(403); return res.end("bad key"); }
    const rows = p.includes("rounds")
      ? history.flatMap((h) => h.scores.map((s, rank) => ({ round: h.no, wormhole: h.wormhole ? 1 : 0, n_companies: h.companies, n_players: h.players, realized_avg: h.realized?.toFixed(3), ne_benchmark: h.ne.toFixed(3), planner: h.planner.toFixed(4), all_selfish: h.selfish, company: s.company, size: s.size, members: s.members, company_score: s.score?.toFixed(3), rank: rank + 1 })))
      : tickLog;
    res.writeHead(200, { "content-type": "text/csv", "content-disposition": `attachment; filename=fleetwars-${p.includes("rounds") ? "rounds" : "ticks"}.csv` });
    return res.end(csv(rows));
  }

  res.writeHead(404); res.end("not found");
});

// Never let one bad request take down the class.
process.on("unhandledRejection", (e) => console.error("unhandled", e));
process.on("uncaughtException", (e) => console.error("uncaught", e));

server.listen(PORT, () => {
  console.log(`Fleet Wars on http://localhost:${PORT}`);
  console.log(`  players:   http://localhost:${PORT}/`);
  console.log(`  projector: http://localhost:${PORT}/screen`);
  console.log(`  admin:     http://localhost:${PORT}/admin?key=${ADMIN_KEY}`);
});
