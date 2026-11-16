// Whiteboard for slide mode: ink over the current slide ("annotate") or on a blank board
// ("board"). Loaded on first use by slide-mode.js.
//
// Strokes are vectors in units of the window width, so they redraw in place when the window is
// resized (slide text scales with the window width too). Each surface (one per slide page, plus
// one blank board per slide) keeps its own strokes and undo history until the page reloads.

const COLORS = [null, "#ef4444", "#3b82f6", "#22c55e", "#f59e0b"]; // null = white on dark, ink on light
const PEN_WIDTH = 0.0025; // of window width: ~5px on a 1920px screen
const ERASER_RADIUS = 0.012;

export const createWhiteboard = (host) => {
  const canvas = document.createElement("canvas");
  canvas.className = "myst-slides-ink";
  host.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const surfaces = new Map(); // key -> { strokes, undo }
  let slideKey = null;
  let mode = null; // null (ink visible, no tool) | "annotate" | "board"
  let color = 0;
  let erasing = false;
  let active = null; // stroke being drawn, or { erased } during an eraser gesture
  let lastPen = 0;

  const surface = () => {
    const key = mode === "board" ? `board:${slideKey}` : slideKey;
    if (!key) return null;
    if (!surfaces.has(key)) surfaces.set(key, { strokes: [], undo: [] });
    return surfaces.get(key);
  };

  const dark = () => document.documentElement.classList.contains("dark");

  const drawSegment = (stroke, a, b) => {
    const w = innerWidth;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width * w * (0.5 + b[2]);
    ctx.beginPath();
    ctx.moveTo(a[0] * w, a[1] * w);
    ctx.lineTo(b[0] * w, b[1] * w);
    ctx.stroke();
  };

  const drawStroke = (stroke) => {
    const pts = stroke.points;
    if (pts.length === 1) drawSegment(stroke, pts[0], pts[0]);
    for (let i = 1; i < pts.length; i += 1) drawSegment(stroke, pts[i - 1], pts[i]);
  };

  const redraw = () => {
    const ratio = devicePixelRatio || 1;
    if (canvas.width !== Math.round(innerWidth * ratio) || canvas.height !== Math.round(innerHeight * ratio)) {
      canvas.width = Math.round(innerWidth * ratio);
      canvas.height = Math.round(innerHeight * ratio);
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.lineCap = ctx.lineJoin = "round";
    if (mode === "board") {
      ctx.fillStyle = dark() ? "#0f172a" : "#ffffff";
      ctx.fillRect(0, 0, innerWidth, innerHeight);
    }
    const strokes = surface()?.strokes ?? [];
    strokes.forEach(drawStroke);
    canvas.dataset.mode = mode ?? "";
    canvas.dataset.erasing = erasing ? "true" : "";
    canvas.hidden = !mode && !strokes.length;
  };

  const point = (event) => [event.clientX / innerWidth, event.clientY / innerWidth, event.pointerType === "pen" ? event.pressure : 0.5];

  const distance = (p, a, b) => {
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const t = dx || dy ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))) : 0;
    return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  };

  // Remove every stroke within the eraser's reach anywhere along its path since the last event.
  const erase = (p) => {
    const from = active.at ?? p;
    active.at = p;
    const steps = Math.ceil(Math.hypot(p[0] - from[0], p[1] - from[1]) / (ERASER_RADIUS / 2)) || 1;
    const path = Array.from({ length: steps + 1 }, (_, i) => [
      from[0] + ((p[0] - from[0]) * i) / steps,
      from[1] + ((p[1] - from[1]) * i) / steps,
    ]);
    const near = (s) => s.points.some((q, i) => path.some((e) => distance(e, s.points[Math.max(0, i - 1)], q) < ERASER_RADIUS));
    const { strokes } = surface();
    const hit = strokes.filter(near);
    if (!hit.length) return;
    active.erased.push(...hit);
    surface().strokes = strokes.filter((s) => !hit.includes(s));
    redraw();
  };

  canvas.addEventListener("pointerdown", (event) => {
    if (!mode || event.button !== 0) return;
    if (event.pointerType === "pen") lastPen = Date.now();
    else if (event.pointerType === "touch" && Date.now() - lastPen < 1000) return; // palm resting while writing
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    if (erasing) {
      active = { erased: [] };
      erase(point(event));
      return;
    }
    const ink = COLORS[color] ?? (dark() ? "#f1f5f9" : "#0f172a");
    active = { color: ink, width: PEN_WIDTH, points: [point(event)] };
    surface().strokes.push(active);
    drawStroke(active);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!active) return;
    if (event.pointerType === "pen") lastPen = Date.now();
    for (const e of event.getCoalescedEvents?.() ?? [event]) {
      if (active.erased) erase(point(e));
      else {
        const p = point(e);
        drawSegment(active, active.points.at(-1), p);
        active.points.push(p);
      }
    }
  });

  const finish = () => {
    if (!active) return;
    const { undo } = surface();
    if (active.erased) {
      if (active.erased.length) undo.push({ removed: active.erased });
    } else undo.push({ added: active });
    active = null;
  };
  canvas.addEventListener("pointerup", finish);
  canvas.addEventListener("pointercancel", finish);

  const undo = () => {
    const s = surface();
    const op = s?.undo.pop();
    if (!op) return;
    if (op.added) s.strokes = s.strokes.filter((stroke) => stroke !== op.added);
    else s.strokes.push(...op.removed);
    redraw();
  };

  const clear = () => {
    const s = surface();
    if (!s?.strokes.length) return;
    s.undo.push({ removed: s.strokes });
    s.strokes = [];
    redraw();
  };

  addEventListener("resize", redraw);

  return {
    get mode() {
      return mode;
    },
    // Show the ink for one slide page; null hides the whiteboard entirely.
    setSlide(key) {
      finish();
      slideKey = key;
      if (!key) mode = null;
      redraw();
    },
    setMode(next) {
      finish();
      mode = next;
      erasing = false;
      redraw();
    },
    // Whiteboard keys while a tool is active; returns true when the key was used.
    handleKey(event) {
      if (!mode) return false;
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === "z") return undo(), true;
      if (command || event.altKey) return false;
      if (/^[1-5]$/.test(event.key)) {
        color = Number(event.key) - 1;
        erasing = false;
        return redraw(), true;
      }
      const actions = { e: () => (erasing = !erasing), u: undo, c: clear, Escape: () => (mode = null) };
      if (!actions[event.key]) return false;
      actions[event.key]();
      redraw();
      return true;
    },
  };
};
