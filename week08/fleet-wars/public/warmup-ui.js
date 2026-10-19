// Warm-up game views (2/3 of the average, and 2x2 matrix games), for phones and the projector.

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const WARM_CSS = `
.wbig { font-size:28px; font-weight:700; }
.matrix { border-collapse:separate; border-spacing:6px; margin:0 auto; }
.matrix th { font-weight:600; color:var(--muted); padding:4px 8px; border:none; }
.matrix td { background:var(--card); border:2px solid var(--line); border-radius:10px; padding:10px 12px; text-align:center; font-variant-numeric:tabular-nums; min-width:96px; }
.matrix td.ne { border:4px solid var(--good); box-shadow:0 0 0 3px color-mix(in srgb, var(--good) 25%, transparent); }
.matrix td.hit { background:color-mix(in srgb, var(--accent) 18%, var(--card)); border-color:var(--accent); }
.matrix .pay b { font-size:1.1em; }
.matrix .count { display:block; font-size:2em; font-weight:800; }
.choice { display:grid; gap:10px; }
.choice button { padding:18px; font-size:20px; font-weight:600; }
.choice button.sel { background:var(--accent); color:#fff; border-color:transparent; }
.hist { display:flex; align-items:flex-end; gap:3px; height:300px; position:relative; border-bottom:2px solid var(--line); }
.hist .bar { flex:1; background:color-mix(in srgb, var(--muted) 45%, var(--card)); border-radius:4px 4px 0 0; min-height:0; }
.hist .mark { position:absolute; bottom:-4px; top:0; border-left:5px solid; }
.hist .mark span { position:absolute; top:-26px; left:6px; white-space:nowrap; font-size:20px; font-weight:700; }
.progress { height:14px; border-radius:999px; background:var(--line); overflow:hidden; }
.progress div { height:100%; background:var(--accent); transition:width .3s; }
.axis { display:flex; justify-content:space-between; color:var(--muted); font-size:13px; margin-top:4px; }
`;
document.head.insertAdjacentHTML("beforeend", `<style>${WARM_CSS}</style>`);

// Payoff cell text, optionally with one side bolded.
function cellText(g, r, c, bold) {
  const [a, b] = g.payoff[r][c];
  return `<span class="pay">${bold === 0 ? `<b>${a}</b>` : a}, ${bold === 1 ? `<b>${b}</b>` : b}</span>`;
}

function matrixTable(g, opts = {}) {
  const ne = new Set(g.nash.map(([r, c]) => `${r}${c}`));
  const rows = [0, 1].map((r) => `<tr><th>${esc(g.actions[0][r])}</th>${[0, 1].map((c) => {
    const cls = [opts.showNe && ne.has(`${r}${c}`) ? "ne" : "", opts.hit && opts.hit[0] === r && opts.hit[1] === c ? "hit" : ""].join(" ");
    const count = opts.counts ? `<span class="count">${opts.counts[r][c]}</span>` : "";
    return `<td class="${cls}">${count}${cellText(g, r, c, opts.bold)}</td>`;
  }).join("")}</tr>`).join("");
  return `<table class="matrix"><tr><th></th><th colspan="2">${esc(g.colLabel)}</th></tr>
    <tr><th>${esc(g.rowLabel)}</th>${[0, 1].map((c) => `<th>${esc(g.actions[1][c])}</th>`).join("")}</tr>${rows}</table>`;
}

function histogram(values, marks) {
  const bins = new Array(20).fill(0);
  for (const v of values) bins[Math.min(19, Math.floor(v / 5))] += 1;
  const max = Math.max(1, ...bins);
  return `<div class="hist">${bins.map((b) => `<div class="bar" style="height:${(b / max) * 100}%" title="${b}"></div>`).join("")}
    ${marks.map(([v, label, color], i) => `<div class="mark" style="left:${v}%; border-color:${color}"><span style="color:${color}; top:${i % 2 ? -52 : -26}px">${label}</span></div>`).join("")}</div>
    <div class="axis"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>`;
}

// ---------------------------------------------------------------- phone

let warmKey = null;
// Remember my own answers per round, so a reload or the reveal can show them.
const myPick = (no, v) => { try { if (v === undefined) return localStorage.getItem(`fw-w-${no}`); localStorage.setItem(`fw-w-${no}`, v); } catch {} return null; };
function renderWarmPlay(el, state, myId) {
  const w = state.warmup, r = w.round;
  const key = r ? `${r.no}-${r.status}` : "none";
  if (!r || !r.roster.includes(myId)) {
    if (warmKey !== "wait") { warmKey = "wait"; el.innerHTML = `<div class="card">Waiting for the next game to start…</div>`; }
    return;
  }
  const submitted = r.submitted.includes(myId);
  if (r.kind === "beauty") {
    if (r.status === "open") {
      if (warmKey !== key) {
        warmKey = key;
        el.innerHTML = `<div class="card" style="display:grid; gap:12px">
          <div class="muted">Round ${r.no}</div>
          <div class="wbig">Pick a number from 0 to 100</div>
          <div>The winner is whoever is closest to <b>2/3 of the class average</b>.</div>
          <form id="bform" class="row" style="display:flex; gap:8px"><input id="bval" required type="number" inputmode="decimal" min="0" max="100" step="any" style="flex:1; font-size:22px"><button class="primary">Submit</button></form>
          <div id="bmsg" class="muted"></div></div>`;
        el.querySelector("#bform").onsubmit = async (e) => {
          e.preventDefault();
          const v = el.querySelector("#bval").value;
          const res = await post("/api/w/submit", { id: myId, value: v });
          if (!res.error) myPick(r.no, v);
          el.querySelector("#bmsg").textContent = res.error || `Locked in: ${v}. You can change it until the reveal.`;
        };
      }
      if (submitted && !el.querySelector("#bmsg").textContent) el.querySelector("#bmsg").textContent = "Locked in. You can change it until the reveal.";
    } else if (warmKey !== key) {
      warmKey = key;
      const res = r.result, mine = submitted ? myPick(r.no) : null;
      el.innerHTML = `<div class="card" style="display:grid; gap:8px">
        <div class="muted">Round ${r.no} results</div>
        <div>Average: <b>${fmt(res.avg)}</b></div>
        <div>2/3 of the average: <b class="wbig">${fmt(res.target)}</b></div>
        ${mine !== null && mine !== "" ? `<div>Your guess: <b>${esc(mine)}</b>, off by <b>${fmt(Math.abs(Number(mine) - res.target))}</b></div>` : ""}
        <div>Winner${res.winners.length > 1 ? "s" : ""}: <b>${res.winners.map(esc).join(", ") || "–"}</b></div></div>`;
    }
    return;
  }
  // Matrix game
  const g = w.games[r.game];
  const me = r.roles[myId];
  const role = me.role;
  const partner = me.partner ? state.players.find((p) => p.id === me.partner)?.name ?? "?" : "a bot";
  if (r.status === "open") {
    if (warmKey !== key) {
      warmKey = key;
      el.innerHTML = `<div class="card" style="display:grid; gap:12px">
        <div class="muted">${esc(g.name)} · Round ${r.no}</div>
        <div>You are <b>${esc(role === 0 ? g.rowLabel : g.colLabel)}</b> (${role === 0 ? "rows" : "columns"}), playing against <b>${esc(partner)}</b>. Your payoffs are in bold (${esc(g.unit)}).</div>
        ${matrixTable(g, { bold: role })}
        <div class="choice">${[0, 1].map((a) => `<button data-a="${a}">${esc(g.actions[role][a])}</button>`).join("")}</div>
        <div id="mmsg" class="muted"></div></div>`;
      el.querySelectorAll(".choice button").forEach((btn) => (btn.onclick = async () => {
        const res = await post("/api/w/submit", { id: myId, value: Number(btn.dataset.a) });
        if (!res.error) { myPick(r.no, btn.dataset.a); el.querySelectorAll(".choice button").forEach((b) => b.classList.toggle("sel", b === btn)); }
        el.querySelector("#mmsg").textContent = res.error || "Locked in. You can change it until the reveal.";
      }));
      const prev = submitted ? myPick(r.no) : null;
      if (prev !== null) {
        el.querySelectorAll(".choice button").forEach((b) => b.classList.toggle("sel", b.dataset.a === prev));
        el.querySelector("#mmsg").textContent = "Locked in. You can change it until the reveal.";
      }
    }
  } else if (warmKey !== key) {
    warmKey = key;
    const o = r.result.outcomes[myId];
    const hit = o ? (role === 0 ? [o.mine, o.theirs] : [o.theirs, o.mine]) : null;
    el.innerHTML = `<div class="card" style="display:grid; gap:12px">
      <div class="muted">${esc(g.name)} · Round ${r.no} results</div>
      ${o ? `<div>You played <b>${esc(g.actions[role][o.mine])}</b>, ${esc(o.partner)} played <b>${esc(g.actions[1 - role][o.theirs])}</b>.</div>
      <div>Your payoff: <span class="wbig">${o.payoff}</span> ${esc(g.unit)}</div>` : `<div>You didn't choose in time.</div>`}
      ${matrixTable(g, { bold: role, hit })}</div>`;
  }
}

// ---------------------------------------------------------------- projector

function renderWarmScreen(el, state) {
  const w = state.warmup, r = w.round;
  if (!r) { el.innerHTML = `<div class="card wbig">Get ready…</div>`; return; }
  const n = r.roster.length, k = r.submitted.length;
  if (r.kind === "beauty") {
    const res = r.result;
    const past = w.history.map((h) => `<tr><td>${h.no}</td><td class="n">${h.n}</td><td class="n">${fmt(h.avg)}</td><td class="n"><b>${fmt(h.target)}</b></td><td>${h.winners.map(esc).join(", ")}</td></tr>`).join("");
    el.innerHTML = `<div style="display:grid; grid-template-columns:minmax(0,2fr) minmax(0,1fr); gap:16px; height:100%">
      <section class="card" style="display:grid; gap:14px; align-content:start">
        <div style="font-size:30px; font-weight:800">Guess 2/3 of the average</div>
        ${r.status === "open"
          ? `<div class="big">${k} / ${n} submitted</div><div class="progress"><div style="width:${n ? (k / n) * 100 : 0}%"></div></div><div class="muted" style="font-size:20px">Pick a number from 0 to 100 on your phone. Closest to 2/3 of the class average wins.</div>`
          : `<div style="display:flex; gap:40px"><div><div class="muted">Average</div><div class="big">${fmt(res.avg)}</div></div><div><div class="muted">2/3 of average</div><div class="big" style="color:var(--accent)">${fmt(res.target)}</div></div><div><div class="muted">Winner</div><div style="font-size:28px; font-weight:700; margin-top:10px">${res.winners.map(esc).join(", ") || "–"}</div></div></div>
             <div style="margin-top:48px">${histogram(res.values, [[res.target, `2/3 avg ${fmt(res.target)}`, "var(--accent)"], [res.avg, `avg ${fmt(res.avg)}`, "var(--muted)"], ...(w.showNe ? [[0.4, "NE 0", "var(--good)"]] : [])])}</div>`}
      </section>
      <section class="card" style="align-content:start"><div class="muted">Rounds</div><table><thead><tr><th>#</th><th class="n">n</th><th class="n">Avg</th><th class="n">Target</th><th>Winner</th></tr></thead><tbody>${past}</tbody></table>${past ? "" : `<div class="muted" style="margin-top:8px">Results appear here after each reveal.</div>`}</section></div>`;
    return;
  }
  const g = w.games[r.game];
  const res = r.result;
  const pct = (a) => { const t = a[0] + a[1]; return t ? Math.round((a[0] / t) * 100) : 0; };
  const series = w.history.map((h) => `<tr><td>${h.no}</td><td class="n">${pct(h.byRole[0])}%</td><td class="n">${pct(h.byRole[1])}%</td></tr>`).join("");
  el.innerHTML = `<div style="display:grid; grid-template-columns:minmax(0,2fr) minmax(0,1fr); gap:16px; height:100%">
    <section class="card" style="display:grid; gap:16px; align-content:start">
      <div style="font-size:30px; font-weight:800">${esc(g.name)} <span class="muted" style="font-size:20px; font-weight:400">Round ${r.no} · random partners · payoffs in ${esc(g.unit)}</span></div>
      ${r.status === "open" ? `<div class="big">${k} / ${n} chose</div><div class="progress"><div style="width:${n ? (k / n) * 100 : 0}%"></div></div>` : `<div class="muted" style="font-size:18px">Big numbers count how many pairs landed in each cell. Green outline = pure Nash equilibrium${g.nash.length ? "" : " (there is none)"}.</div>`}
      <div style="font-size:22px">${matrixTable(g, { counts: res ? res.cells : null, showNe: r.status === "revealed" })}</div>
      ${res ? `<div style="font-size:20px">${esc(g.rowLabel)}: <b>${pct(res.byRole[0])}%</b> ${esc(g.actions[0][0])} · ${esc(g.colLabel)}: <b>${pct(res.byRole[1])}%</b> ${esc(g.actions[1][0])}</div>` : ""}
    </section>
    <div style="display:grid; gap:16px; align-content:start">
      <section class="card" ${w.leaderboard.length ? "" : "hidden"}><div class="muted">Leaderboard (total ${esc(g.unit)})</div><table><tbody>${w.leaderboard.map((l) => `<tr><td>${esc(l.name)}</td><td class="n"><b>${l.score}</b></td></tr>`).join("")}</tbody></table></section>
      <section class="card" ${series ? "" : "hidden"}><div class="muted">Share choosing the first action, by round</div><table><thead><tr><th>#</th><th class="n">${esc(g.rowLabel)}: ${esc(g.actions[0][0])}</th><th class="n">${esc(g.colLabel)}: ${esc(g.actions[1][0])}</th></tr></thead><tbody>${series}</tbody></table></section>
    </div></div>`;
}
