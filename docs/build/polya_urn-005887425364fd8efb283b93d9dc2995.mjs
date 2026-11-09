// Pólya urn / Arthur increasing-returns animation for L10.02.
// Each draw: pick a ball (tilted by gamma), put it back, add one more of the same color.
const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const A = { fill: "#3B82F6", light: "#DBEAFE", dark: "#1E40AF" };
const B = { fill: "#F59E0B", light: "#FEF3C7", dark: "#92400E" };
const SVGNS = "http://www.w3.org/2000/svg";

function svg(tag, attrs = {}) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function button(label, onClick, primary = false) {
  const b = document.createElement("button");
  b.textContent = label;
  Object.assign(b.style, {
    padding: "6px 14px",
    border: `2px solid ${primary ? A.fill : "#94A3B8"}`,
    borderRadius: "8px",
    background: primary ? A.light : "#F8FAFC",
    color: primary ? A.dark : "#334155",
    fontSize: "14px",
    fontFamily: FONT,
    cursor: "pointer",
  });
  b.addEventListener("click", onClick);
  return b;
}

function render({ model, el }) {
  const maxDraws = model.get("max_draws") ?? 200;
  const maxRuns = 25;
  let gamma = model.get("gamma") ?? 1;
  let nA = 1, nB = 1, path = [0.5], runs = [], timer = null, restart = null, lastDraw = null;

  const root = document.createElement("div");
  Object.assign(root.style, {
    fontFamily: FONT, color: "#1E293B", border: "1px solid #E2E8F0",
    borderRadius: "12px", padding: "14px", background: "#FFFFFF", maxWidth: "860px",
  });

  // Controls
  const controls = document.createElement("div");
  Object.assign(controls.style, { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "10px" });
  const stepBtn = button("Draw one ball", () => { stop(); step(); }, true);
  const playBtn = button("▶ Play", () => (timer ? stop() : play()), true);
  const newBtn = button("New urn", () => { stop(); newRun(); });
  const clearBtn = button("Clear history", () => { stop(); runs = []; newRun(); });
  const gammaSel = document.createElement("select");
  Object.assign(gammaSel.style, { padding: "6px", borderRadius: "8px", fontFamily: FONT, fontSize: "14px" });
  for (const [v, label] of [[1, "γ = 1: classic Pólya urn"], [2, "γ = 2: strong increasing returns"]]) {
    const o = document.createElement("option");
    o.value = v; o.textContent = label; if (v === gamma) o.selected = true;
    gammaSel.appendChild(o);
  }
  gammaSel.addEventListener("change", () => {
    stop(); gamma = Number(gammaSel.value); runs = []; newRun();
  });
  controls.append(stepBtn, playBtn, newBtn, clearBtn, gammaSel);

  // Layout: urn (left) and share chart (right)
  const body = document.createElement("div");
  Object.assign(body.style, { display: "flex", gap: "14px", flexWrap: "wrap" });

  const urnW = 260, urnH = 300;
  const urnSvg = svg("svg", { viewBox: `0 0 ${urnW} ${urnH}`, width: urnW, height: urnH });
  urnSvg.appendChild(svg("path", {
    d: "M60 30 L200 30 L200 50 Q240 70 235 150 L225 270 Q222 285 205 285 L55 285 Q38 285 35 270 L25 150 Q20 70 60 50 Z",
    fill: "#F8FAFC", stroke: "#475569", "stroke-width": 3,
  }));
  const ballLayer = svg("g");
  urnSvg.appendChild(ballLayer);
  const drawnBall = svg("circle", { cx: 130, cy: 14, r: 10, fill: "none", stroke: "none" });
  urnSvg.appendChild(drawnBall);

  const chartW = 520, chartH = 300, pad = { l: 46, r: 12, t: 14, b: 38 };
  const chart = svg("svg", { viewBox: `0 0 ${chartW} ${chartH}`, width: chartW, height: chartH });
  const plotW = chartW - pad.l - pad.r, plotH = chartH - pad.t - pad.b;
  const x = (t) => pad.l + (t / maxDraws) * plotW;
  const y = (s) => pad.t + (1 - s) * plotH;
  for (const s of [0, 0.25, 0.5, 0.75, 1]) {
    chart.appendChild(svg("line", { x1: pad.l, x2: chartW - pad.r, y1: y(s), y2: y(s), stroke: s === 0.5 ? "#94A3B8" : "#E2E8F0", "stroke-dasharray": s === 0.5 ? "4 4" : "" }));
    const lab = svg("text", { x: pad.l - 6, y: y(s) + 4, "text-anchor": "end", "font-size": 11, fill: "#64748B", "font-family": FONT });
    lab.textContent = s.toFixed(2); chart.appendChild(lab);
  }
  for (const t of [0, maxDraws / 2, maxDraws]) {
    const lab = svg("text", { x: x(t), y: chartH - pad.b + 16, "text-anchor": "middle", "font-size": 11, fill: "#64748B", "font-family": FONT });
    lab.textContent = t; chart.appendChild(lab);
  }
  const xl = svg("text", { x: pad.l + plotW / 2, y: chartH - 4, "text-anchor": "middle", "font-size": 12, fill: "#334155", "font-family": FONT });
  xl.textContent = "Draws (new adopters)"; chart.appendChild(xl);
  const yl = svg("text", { x: 12, y: pad.t + plotH / 2, "text-anchor": "middle", "font-size": 12, fill: "#334155", "font-family": FONT, transform: `rotate(-90 12 ${pad.t + plotH / 2})` });
  yl.textContent = "Share of blue (A)"; chart.appendChild(yl);
  const pastLayer = svg("g"); chart.appendChild(pastLayer);
  const current = svg("polyline", { fill: "none", stroke: A.dark, "stroke-width": 2.5 }); chart.appendChild(current);

  const info = document.createElement("div");
  Object.assign(info.style, { fontSize: "14px", marginTop: "8px", lineHeight: "1.5" });

  body.append(urnSvg, chart);
  root.append(controls, body, info);
  el.appendChild(root);

  // Ball positions: fill the urn bottom-up in rows; show at most 240 balls, scaled to the true mix.
  function drawUrn() {
    ballLayer.replaceChildren();
    const total = nA + nB, shown = Math.min(total, 240);
    const blue = Math.round((nA / total) * shown);
    const r = shown <= 60 ? 9 : shown <= 140 ? 6.5 : 5;
    const gap = 2 * r + 2, perRow = Math.floor(170 / gap);
    // Deterministic shuffle so colors mix rather than stack
    const colors = Array.from({ length: shown }, (_, i) => (i < blue ? A : B));
    let seed = 7;
    for (let i = colors.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [colors[i], colors[j]] = [colors[j], colors[i]];
    }
    colors.forEach((c, i) => {
      const row = Math.floor(i / perRow), col = i % perRow;
      const offset = row % 2 ? gap / 2 : 0;
      ballLayer.appendChild(svg("circle", {
        cx: 45 + r + col * gap + offset, cy: 272 - r - row * (gap - 1),
        r, fill: c.fill, stroke: c.dark, "stroke-width": 1,
      }));
    });
    if (lastDraw) {
      drawnBall.setAttribute("fill", lastDraw.fill);
      drawnBall.setAttribute("stroke", lastDraw.dark);
      drawnBall.setAttribute("stroke-width", 2);
    } else {
      drawnBall.setAttribute("fill", "none"); drawnBall.setAttribute("stroke", "none");
    }
  }

  function pointsFor(p) { return p.map((s, t) => `${x(t)},${y(s)}`).join(" "); }

  function drawChart() {
    pastLayer.replaceChildren();
    for (const p of runs) {
      pastLayer.appendChild(svg("polyline", { points: pointsFor(p), fill: "none", stroke: "#94A3B8", "stroke-width": 1.2, opacity: 0.6 }));
    }
    current.setAttribute("points", pointsFor(path));
  }

  function probA() {
    const a = Math.pow(nA, gamma), b = Math.pow(nB, gamma);
    return a / (a + b);
  }

  function drawInfo() {
    const t = path.length - 1, share = nA / (nA + nB);
    const finals = runs.map((p) => p[p.length - 1]);
    const lockedIn = finals.filter((s) => s <= 0.1 || s >= 0.9).length;
    info.innerHTML =
      `<b>Draw ${t} of ${maxDraws}</b> · urn holds <span style="color:${A.dark}">${nA} blue</span> and ` +
      `<span style="color:${B.dark}">${nB} orange</span> · share of blue = <b>${share.toFixed(2)}</b> · ` +
      `P(next draw is blue) = <b>${probA().toFixed(2)}</b>` +
      (finals.length
        ? `<br>Finished urns (gray): ${finals.length}; ending above 0.9 or below 0.1: <b>${lockedIn}</b>`
        : `<br>Every urn starts with one blue and one orange ball. Run several and compare where they end.`);
  }

  function refresh() { drawUrn(); drawChart(); drawInfo(); playBtn.textContent = timer ? "❚❚ Pause" : "▶ Play"; }

  function step() {
    if (path.length - 1 >= maxDraws) return false;
    const blue = Math.random() < probA();
    lastDraw = blue ? A : B;
    if (blue) nA += 1; else nB += 1;
    path.push(nA / (nA + nB));
    refresh();
    return path.length - 1 < maxDraws;
  }

  function newRun() {
    if (path.length - 1 >= maxDraws) runs = [...runs, path].slice(-maxRuns);
    nA = 1; nB = 1; path = [0.5]; lastDraw = null;
    refresh();
  }

  function play() {
    if (path.length - 1 >= maxDraws) newRun();
    timer = setInterval(() => {
      if (!step()) {
        stop();
        // Auto-start the next urn so the history of finished urns builds up
        restart = setTimeout(() => { newRun(); if (runs.length < maxRuns) play(); }, 600);
      }
    }, 40);
    refresh();
  }

  function stop() {
    clearInterval(timer);
    clearTimeout(restart);
    timer = null;
    refresh();
  }

  refresh();
  return () => { stop(); root.remove(); };
}

export default { render };
