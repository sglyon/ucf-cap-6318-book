// Slide mode for the MyST book-theme site.
//
// Present any lecture page screen by screen. Slides come from Jupyter/RISE cell metadata
// (`slideshow.slide_type`): `slide` and `subslide` start a new screen, `fragment` reveals on the
// next advance, `-` continues, `skip` and `notes` are hidden. Pages without any slide metadata
// split at level 1-3 headings.
//
// Every screen fits the window. A slide that is a little too tall shrinks (down to MIN_ZOOM);
// one that is still too tall (a long code cell or output) is cut into screen-sized pages at
// line and element boundaries, and the next/back keys step through those pages.
//
// Enter with `?slides` in the URL, the "Slides" button, or the `s` key; press `?` in slide mode
// for every key (the KEYS table below).
//
// The theme is a hydrated React app, so this script never edits React-owned markup: it removes
// its own <script> tag before hydration, styles the page only through adopted stylesheets, and
// adds its own controls after the page has hydrated. The whiteboard lives in whiteboard.js,
// loaded the first time it is used.
(() => {
  const script = document.currentScript;
  const base = new URL(".", script.src);
  const version = new URL(script.src).search;
  script.remove();

  const PAD = 24; // px of breathing room above and below a slide
  const MIN_ZOOM = 0.75; // smallest shrink that keeps text readable from the back of a room
  const PARAM = "slides";
  const SCALE_KEY = "myst-slides-text-scale";
  const CURSOR_IDLE_MS = 2000;

  const KEYS = [
    ["Space  →  ↓  PageDown  Enter", "Next"],
    ["Shift+Space  ←  ↑  PageUp  Backspace", "Back"],
    ["[  ]", "Previous / next section"],
    ["Home  End", "First / last slide"],
    ["12 then Enter", "Go to slide 12"],
    ["o", "Outline of slides"],
    ["d", "Draw on the slide"],
    ["w", "Blank whiteboard"],
    ["1–5  e  u  c", "While drawing: colour, eraser, undo (or ⌘Z), clear"],
    ["b  .", "Black screen"],
    ["l", "Laser pointer"],
    ["t", "Timer and clock (Shift+T restarts the timer)"],
    ["+  −  0", "Larger / smaller / default text"],
    ["f", "Fullscreen"],
    ["?", "This help"],
    ["Esc  s", "Close a panel or tool, else leave slide mode"],
  ];

  const sheet = new CSSStyleSheet(); // slide layout
  const cursorSheet = new CSSStyleSheet(); // hides the mouse cursor while presenting
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet, cursorSheet];

  const BASE_CSS = `
    .myst-slides-control {
      position: fixed; right: 16px; bottom: 16px; z-index: 60;
      font: 600 13px/1 system-ui, sans-serif; padding: 8px 12px; border-radius: 6px;
      border: 1px solid rgb(148 163 184 / .5); background: rgb(255 255 255 / .85); color: #1e293b;
      cursor: pointer; opacity: .55; transition: opacity .15s;
    }
    .myst-slides-control:hover { opacity: 1; }
    .dark .myst-slides-control { background: rgb(30 41 59 / .85); color: #e2e8f0; }
    .myst-slides-ui > :not(.myst-slides-control) { display: none; }
    @media print { .myst-slides-ui { display: none; } }
  `;

  // Overlays that exist only while presenting.
  const UI_CSS = `
    .myst-slides-ui { font: 16px/1.4 system-ui, sans-serif; }
    .myst-slides-ui [hidden] { display: none !important; }
    .myst-slides-ink { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 55;
      display: block !important; pointer-events: none; }
    .myst-slides-ink[data-mode="annotate"], .myst-slides-ink[data-mode="board"] {
      pointer-events: auto; cursor: crosshair; touch-action: none; }
    .myst-slides-ink[data-erasing="true"] { cursor: cell; }
    .myst-slides-panel { position: fixed; z-index: 70; inset: 8vh 50% auto auto; transform: translateX(50%);
      display: block !important; max-height: 84vh; overflow: auto; min-width: 28rem; padding: 20px 24px;
      border-radius: 10px; background: rgb(15 23 42 / .94); color: #e2e8f0;
      box-shadow: 0 20px 60px rgb(0 0 0 / .5); }
    .myst-slides-panel h2 { margin: 0 0 12px; font-size: 18px; font-weight: 700; }
    .myst-slides-panel table { border-collapse: collapse; }
    .myst-slides-panel td { padding: 4px 16px 4px 0; vertical-align: top; }
    .myst-slides-panel td:first-child { font-family: ui-monospace, monospace; color: #93c5fd; white-space: nowrap; }
    .myst-slides-panel ol { list-style: none; margin: 0; padding: 0; }
    .myst-slides-panel li { padding: 4px 10px; border-radius: 6px; cursor: pointer; white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis; max-width: 60vw; }
    .myst-slides-panel li[data-sub] { padding-left: 28px; color: #94a3b8; }
    .myst-slides-panel li[data-current] { outline: 1px solid #64748b; }
    .myst-slides-panel li[aria-selected="true"] { background: #2563eb; color: white; }
    .myst-slides-toast, .myst-slides-timer { position: fixed; z-index: 61; display: block !important;
      padding: 6px 12px; border-radius: 6px; background: rgb(15 23 42 / .85); color: #e2e8f0;
      font: 600 15px/1.2 ui-monospace, monospace; }
    .myst-slides-toast { left: 50%; bottom: 24px; transform: translateX(-50%); }
    .myst-slides-timer { right: 16px; top: 16px; }
    .myst-slides-laser { position: fixed; z-index: 58; display: block !important; width: 16px; height: 16px;
      margin: -8px 0 0 -8px; border-radius: 50%; pointer-events: none; background: #ef4444;
      box-shadow: 0 0 10px 4px rgb(239 68 68 / .6); }
    .myst-slides-black { position: fixed; inset: 0; z-index: 80; display: block !important; background: black; }
  `;

  // Styles active only while presenting; `selectors` are the blocks on the current step and
  // `page` ({ height }) clips the slide to one screen-sized window.
  // Sizing follows RISE (1024x768 scaled to the screen): text scales with viewport width and a
  // slide is 64rem wide, so a 1920x1080 screen shows 22px text in a 1408px column.
  const slideCss = (selectors, zoom, page) => `
    ${BASE_CSS}
    ${UI_CSS}
    html { font-size: ${(1.15 * scale).toFixed(3)}vw !important; scroll-behavior: auto !important; }
    html, body { overflow: hidden !important; }
    body > :not(main):not(.myst-slides-ui):not(dialog) { display: none !important; }
    main.article-grid, main > article.article-grid { display: block !important; }
    main > article { padding: ${PAD}px 0 !important; margin: 0 auto !important; min-height: 0 !important;
      width: min(64rem, 94vw); zoom: ${zoom}; }
    ${page ? `main.article-grid > article.content { padding: 0 !important; margin-top: ${PAD}px !important;
      height: ${page.height}px; overflow: hidden !important; }` : ""}
    main > article > * { display: none !important; }
    ${selectors.join(", ")} { display: block !important; margin-left: 0 !important;
      margin-right: 0 !important; max-width: none !important; }
    /* Leave room for a heading and a few bullets beside any picture. */
    main > article img, main > article video { max-height: 75vh; width: auto; object-fit: contain; }
    .myst-slides-control { opacity: .35; cursor: default; }
  `;

  const pages = new Map(); // slug -> Promise<slide[]>
  // { slug, slides, index, step, page, windows, startedAt }: `windows` are the screen-sized pages
  // of the current step when it is too tall to shrink, else null.
  let state = null;
  let scale = Number(localStorage.getItem(SCALE_KEY)) || 1;
  let digits = ""; // slide number typed so far
  let outlineSelection = 0;
  let laser = false;
  let board = null; // the whiteboard, once loaded by the first `d` or `w`
  let boardLoading = null;
  let ui = null; // { root, control, help, outline, toast, timer, laser, black }

  const slugFor = (loc) => loc.pathname.slice(base.pathname.length).replace(/\/(index\.html)?$/, "") || "index";

  // Plain text of an mdast node; block-level children are separated by a space.
  const INLINE = new Set(["text", "emphasis", "strong", "inlineCode", "link", "crossReference", "inlineMath"]);
  const textOf = (node) => {
    if (typeof node.value === "string") return node.value;
    const parts = (node.children ?? []).map(textOf);
    return parts.join(node.children?.every((c) => INLINE.has(c.type)) ? "" : " ");
  };

  const isHeading = (block) => block.children?.[0]?.type === "heading" && block.children[0].depth <= 3;

  // Outline label: the slide's first heading, else its first text, else its first line of code.
  const titleOf = (blocks) => {
    const nodes = blocks.flatMap((b) => b.children ?? []);
    const heading = nodes.find((n) => n.type === "heading");
    if (heading) return textOf(heading).trim();
    const prose = nodes.filter((n) => n.type !== "code" && n.type !== "outputs").map(textOf).join(" ").trim();
    const code = nodes.find((n) => n.type === "code")?.value.trim().split("\n")[0];
    return (prose || code || "").replace(/\s+/g, " ").slice(0, 80);
  };

  // Group top-level notebook blocks into slides; fragments become numbered steps within a slide.
  // The first slide is labelled with the page title.
  const buildSlides = (blocks, pageTitle) => {
    const typeOf = (b) => b.data?.slideshow?.slide_type;
    const tagged = blocks.some(typeOf);
    const slides = [];
    let current = null;
    for (const block of blocks) {
      const id = block.html_id || block.identifier || block.key; // the theme's DOM id for the block
      const type = tagged ? typeOf(block) : isHeading(block) ? "slide" : "-";
      if (!id || type === "skip" || type === "notes") continue;
      if (!current || ((type === "slide" || type === "subslide") && current.blocks.length)) {
        current = { blocks: [], steps: 0, nodes: [], section: !current || type === "slide" };
        slides.push(current);
      }
      if (type === "fragment" && current.blocks.length) current.steps += 1;
      current.blocks.push({ id, step: current.steps });
      current.nodes.push(block);
    }
    return slides.map(({ nodes, ...slide }, i) => ({ ...slide, title: (i === 0 && pageTitle) || titleOf(nodes) }));
  };

  const loadSlides = (slug) => {
    if (!pages.has(slug)) {
      const page = fetch(new URL(`${slug}.json`, base))
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      const blocks = page.then((p) => (p?.mdast?.children ?? []).filter((b) => b.type === "block"));
      pages.set(slug, Promise.all([blocks, page]).then(([b, p]) => buildSlides(b, p?.frontmatter?.title)));
    }
    return pages.get(slug);
  };

  const setUrl = (index) => {
    const url = new URL(location.href);
    if (index === null) url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, String(index + 1));
    history.replaceState(history.state, "", url);
  };

  const visibleSelectors = () => {
    const { slides, index, step } = state;
    const ids = slides[index].blocks.filter((b) => b.step <= step).map((b) => `#${CSS.escape(b.id)}`);
    return index === 0 ? ["main > article > .myst-fm-block", ...ids] : ids;
  };

  // Offsets (from the top of the slide content) where a page may end without cutting through a
  // line of text: the top of every block-level element and every line of preformatted text.
  const breakPoints = (article, top, bottom) => {
    const points = [0, bottom - top];
    for (const el of article.querySelectorAll("*")) {
      const rect = el.getBoundingClientRect();
      if (!rect.height || rect.bottom <= top || rect.top >= bottom) continue;
      const style = getComputedStyle(el);
      if (style.display.startsWith("inline") || style.display === "contents") continue;
      points.push(rect.top - top);
      if (el.tagName !== "PRE") continue;
      const line = parseFloat(style.lineHeight);
      const first = rect.top - top + parseFloat(style.paddingTop) + parseFloat(style.borderTopWidth);
      if (line > 0) for (let y = first; y < rect.bottom - top; y += line) points.push(y);
    }
    return [...new Set(points.map((p) => Math.round(p)))].filter((p) => p >= 0).sort((a, b) => a - b);
  };

  // Cut the slide content into windows no taller than the screen, ending each at a break point.
  const paginate = (article) => {
    const rect = article.getBoundingClientRect();
    const top = rect.top + PAD;
    const end = Math.round(rect.bottom - PAD - top);
    const room = window.innerHeight - 2 * PAD;
    const points = breakPoints(article, top, top + end);
    const windows = [];
    for (let start = 0; start < end; ) {
      const stop = points.filter((p) => p > start && p <= start + room).pop() ?? Math.min(end, start + room);
      windows.push({ top: start, height: stop - start });
      start = stop;
    }
    return windows;
  };

  // Show the current step. Shrink it when it is a little too tall; cut it into pages otherwise.
  const fit = () => {
    if (!state) return;
    const selectors = visibleSelectors();
    sheet.replaceSync(slideCss(selectors, 1));
    state.windows = null;
    const toEnd = state.page === "end";
    if (toEnd) state.page = 0; // only paged steps have more than one window
    const article = document.querySelector("main > article");
    if (!article) return;
    const height = article.getBoundingClientRect().height;
    if (height <= window.innerHeight) return;
    if (height * MIN_ZOOM <= window.innerHeight - 2) {
      // Zoom rounds layout to whole pixels, so re-measure until the slide is inside the screen.
      let zoom = 1;
      for (let tries = 0; tries < 4; tries += 1) {
        const current = article.getBoundingClientRect().height;
        if (current <= window.innerHeight) return;
        zoom = Math.max(MIN_ZOOM, (zoom * (window.innerHeight - 2)) / current);
        sheet.replaceSync(slideCss(selectors, zoom));
      }
      return;
    }
    state.windows = paginate(article);
    state.page = toEnd ? state.windows.length - 1 : Math.min(state.page, state.windows.length - 1);
    const page = state.windows[state.page];
    sheet.replaceSync(slideCss(selectors, 1, page));
    article.scrollTop = page.top;
  };

  // ---------------------------------------------------------------------------------------------
  // Overlays

  const element = (tag, className, parent) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    parent?.appendChild(el);
    return el;
  };

  const updateControl = () => {
    if (!ui) return;
    const windows = state?.windows;
    ui.control.textContent = !state
      ? "Slides"
      : `${state.index + 1} / ${state.slides.length}` + (windows ? ` · ${state.page + 1}/${windows.length}` : "");
    ui.control.title = state ? "? for keys, Esc to leave slide mode" : "Present this page as slides (s)";
  };

  let toastTimer = 0;
  const toast = (text, ms = 1200) => {
    if (!ui) return;
    ui.toast.textContent = text;
    ui.toast.hidden = !text;
    clearTimeout(toastTimer);
    if (text && ms) toastTimer = setTimeout(() => (ui.toast.hidden = true), ms);
  };

  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    if (!ui || ui.timer.hidden || !state) return;
    const seconds = Math.floor((Date.now() - state.startedAt) / 1000);
    const now = new Date();
    ui.timer.textContent = `${Math.floor(seconds / 60)}:${pad(seconds % 60)}  ·  ${now.getHours()}:${pad(now.getMinutes())}`;
  };
  setInterval(tick, 1000);

  const toggleTimer = (restart) => {
    if (restart) state.startedAt = Date.now();
    else ui.timer.hidden = !ui.timer.hidden;
    tick();
  };

  const toggleHelp = () => {
    ui.outline.hidden = true;
    ui.help.hidden = !ui.help.hidden;
  };

  const renderOutline = () => {
    const list = ui.outline.querySelector("ol");
    list.replaceChildren(
      ...state.slides.map((slide, i) => {
        const item = element("li");
        item.textContent = `${i + 1}. ${slide.title}`;
        if (!slide.section) item.dataset.sub = "";
        if (i === state.index) item.dataset.current = "";
        item.setAttribute("aria-selected", String(i === outlineSelection));
        item.addEventListener("click", () => jumpFromOutline(i));
        return item;
      }),
    );
    list.children[outlineSelection]?.scrollIntoView({ block: "nearest" });
  };

  const toggleOutline = () => {
    ui.help.hidden = true;
    ui.outline.hidden = !ui.outline.hidden;
    if (ui.outline.hidden) return;
    outlineSelection = state.index;
    renderOutline();
  };

  const jumpFromOutline = (index) => {
    ui.outline.hidden = true;
    go(index, 0);
  };

  const outlineKey = (key) => {
    const moves = { ArrowDown: 1, ArrowRight: 1, j: 1, ArrowUp: -1, ArrowLeft: -1, k: -1, PageDown: 10, PageUp: -10 };
    if (key in moves) {
      outlineSelection = Math.max(0, Math.min(state.slides.length - 1, outlineSelection + moves[key]));
      renderOutline();
    } else if (key === "Enter" || key === " ") jumpFromOutline(outlineSelection);
    else if (key === "Escape" || key === "o") toggleOutline();
    else return false;
    return true;
  };

  const toggleBlack = () => (ui.black.hidden = !ui.black.hidden);

  const toggleLaser = () => {
    laser = !laser;
    ui.laser.hidden = true;
    showCursor();
  };

  const setScale = (next) => {
    scale = Math.round(Math.max(0.6, Math.min(1.8, next)) * 10) / 10;
    localStorage.setItem(SCALE_KEY, String(scale));
    refit();
    toast(`Text ${Math.round(scale * 100)}%`);
  };

  // Hide the mouse cursor once it rests, except while a whiteboard tool needs it.
  let cursorTimer = 0;
  const showCursor = () => {
    clearTimeout(cursorTimer);
    cursorSheet.replaceSync(laser && state ? "html, html * { cursor: none !important; }" : "");
    if (!state || laser) return;
    cursorTimer = setTimeout(() => {
      if (state && !board?.mode) cursorSheet.replaceSync("html, html * { cursor: none !important; }");
    }, CURSOR_IDLE_MS);
  };
  document.addEventListener("pointermove", (event) => {
    showCursor();
    if (!laser || !ui) return;
    ui.laser.hidden = false;
    ui.laser.style.left = `${event.clientX}px`;
    ui.laser.style.top = `${event.clientY}px`;
  });

  const slideKey = () => (state ? `${state.slug}:${state.index}:${state.page}` : null);

  const toggleWhiteboard = async (mode) => {
    boardLoading ??= import(new URL(`slide-mode-whiteboard.js${version}`, base)).then(({ createWhiteboard }) => {
      board = createWhiteboard(ui.root);
      board.setSlide(slideKey());
    });
    await boardLoading;
    board.setMode(board.mode === mode ? null : mode);
    showCursor();
  };

  const mountUi = () => {
    const root = element("div", "myst-slides-ui", document.body);
    const control = element("button", "myst-slides-control", root);
    control.type = "button";
    control.addEventListener("click", () => state || enter());

    const help = element("div", "myst-slides-panel", root);
    help.hidden = true;
    element("h2", "", help).textContent = "Slide mode keys";
    const rows = element("table", "", help);
    for (const [keys, action] of KEYS) {
      const row = element("tr", "", rows);
      element("td", "", row).textContent = keys;
      element("td", "", row).textContent = action;
    }

    const outline = element("div", "myst-slides-panel", root);
    outline.hidden = true;
    element("h2", "", outline).textContent = "Outline";
    element("ol", "", outline);

    const make = (className) => Object.assign(element("div", className, root), { hidden: true });
    ui = { root, control, help, outline, toast: make("myst-slides-toast"), timer: make("myst-slides-timer"), laser: make("myst-slides-laser"), black: make("myst-slides-black") };
    updateControl();
  };

  const closeOverlays = () => {
    if (!ui) return;
    for (const el of [ui.help, ui.outline, ui.black, ui.timer, ui.toast, ui.laser]) el.hidden = true;
    laser = false;
    digits = "";
  };

  // ---------------------------------------------------------------------------------------------
  // Navigation

  // `page` is a window index within the step, or "end" for its last window.
  const go = (index, step, page = 0) => {
    state.index = Math.max(0, Math.min(state.slides.length - 1, index));
    state.step = step === "end" ? state.slides[state.index].steps : step;
    state.page = page;
    fit();
    window.scrollTo(0, 0);
    setUrl(state.index);
    updateControl();
    if (board?.mode === "board") board.setMode(null);
    board?.setSlide(slideKey());
  };

  const next = () => {
    const { index, step, page, windows, slides } = state;
    if (windows && page < windows.length - 1) go(index, step, page + 1);
    else if (step < slides[index].steps) go(index, step + 1);
    else if (index < slides.length - 1) go(index + 1, 0);
  };

  const prev = () => {
    const { index, step, page, windows } = state;
    if (windows && page > 0) go(index, step, page - 1);
    else if (step > 0) go(index, step - 1, "end");
    else if (index > 0) go(index - 1, "end", "end");
  };

  const sectionStarts = () => state.slides.flatMap((slide, i) => (slide.section ? [i] : []));
  const nextSection = () => {
    const target = sectionStarts().find((i) => i > state.index);
    if (target !== undefined) go(target, 0);
  };
  const prevSection = () => {
    const starts = sectionStarts().filter((i) => i < state.index || (i === state.index && state.step + state.page > 0));
    go(starts.at(-1) ?? 0, 0);
  };

  const begin = (slug, slides, index) => {
    state = { slug, slides, index: 0, step: 0, page: 0, windows: null, startedAt: Date.now() };
    go(index, 0);
    showCursor();
  };

  const enter = async (index = 0) => {
    const slug = slugFor(location);
    const slides = await loadSlides(slug);
    if (slides.length) begin(slug, slides, index);
  };

  const exit = () => {
    if (!state) return;
    const first = state.slides[state.index].blocks[0]?.id;
    state = null;
    closeOverlays();
    board?.setSlide(null);
    sheet.replaceSync(BASE_CSS);
    showCursor();
    setUrl(null);
    updateControl();
    if (document.fullscreenElement) document.exitFullscreen();
    if (first) document.getElementById(first)?.scrollIntoView();
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  // Esc closes the innermost thing that is open; only with nothing open does it leave slide mode.
  const escape = () => {
    if (digits) return (digits = ""), toast("");
    if (!ui.help.hidden) return void (ui.help.hidden = true);
    if (!ui.black.hidden) return void (ui.black.hidden = true);
    if (laser) return toggleLaser();
    if (board?.mode) return board.setMode(null);
    exit();
  };

  // A typed number followed by Enter jumps to that slide.
  const typeDigit = (key) => {
    digits = (digits + key).slice(-4);
    toast(`Go to slide ${digits} ↵`, 3000);
    clearTimeout(typeDigit.timer);
    typeDigit.timer = setTimeout(() => (digits = ""), 3000);
  };
  const enterKey = () => {
    if (!digits) return next();
    const target = Number(digits) - 1;
    digits = "";
    toast("");
    go(target, 0);
  };
  const backspaceKey = () => {
    if (!digits) return prev();
    digits = digits.slice(0, -1);
    toast(digits ? `Go to slide ${digits} ↵` : "", 3000);
  };

  const typing = (target) =>
    target instanceof Element &&
    target.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']");

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.defaultPrevented || typing(event.target)) return;
      if (!state) {
        if (event.key === "s" && !event.metaKey && !event.ctrlKey && !event.altKey) {
          event.preventDefault();
          enter();
        }
        return;
      }
      const consume = () => {
        event.preventDefault();
        event.stopPropagation();
      };
      // Whiteboard tool keys (colours, eraser, undo incl. ⌘Z) take priority while drawing.
      if (board?.handleKey(event)) return consume(), showCursor();
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (ui && !ui.outline.hidden) return outlineKey(event.key) && consume();

      if (/^[0-9]$/.test(event.key) && (digits || event.key !== "0")) return consume(), typeDigit(event.key);
      const actions = {
        " ": () => (event.shiftKey ? prev() : next()),
        ArrowRight: next,
        ArrowDown: next,
        PageDown: next,
        Enter: enterKey,
        ArrowLeft: prev,
        ArrowUp: prev,
        PageUp: prev,
        Backspace: backspaceKey,
        Home: () => go(0, 0),
        End: () => go(state.slides.length - 1, "end", "end"),
        "]": nextSection,
        "[": prevSection,
        o: toggleOutline,
        d: () => toggleWhiteboard("annotate"),
        w: () => toggleWhiteboard("board"),
        b: toggleBlack,
        ".": toggleBlack,
        l: toggleLaser,
        t: () => toggleTimer(false),
        T: () => toggleTimer(true),
        "+": () => setScale(scale + 0.1),
        "=": () => setScale(scale + 0.1),
        "-": () => setScale(scale - 0.1),
        0: () => setScale(1),
        f: toggleFullscreen,
        "?": toggleHelp,
        Escape: escape,
        s: exit,
      };
      const action = actions[event.key];
      if (!action || !ui) return;
      consume();
      digits = action === enterKey || action === backspaceKey ? digits : "";
      action();
    },
    true,
  );

  // A link to another lecture opens it in slide mode too. The static site reloads the document
  // on navigation, so carry the mode in the URL rather than following the theme's router.
  document.addEventListener(
    "click",
    (event) => {
      const link = state && event.button === 0 && event.target instanceof Element && event.target.closest("a[href]");
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || link.target === "_blank") return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      event.preventDefault();
      event.stopPropagation();
      url.searchParams.set(PARAM, "1");
      location.assign(url);
    },
    true,
  );

  // Back/forward under `myst start` swaps the article without a page load; follow it.
  window.addEventListener("popstate", async () => {
    const slug = slugFor(location);
    if (!state || slug === state.slug) return;
    const slides = await loadSlides(slug);
    if (!slides.length) return exit();
    begin(slug, slides, 0);
  });
  const refit = () => {
    fit();
    updateControl();
  };
  window.addEventListener("resize", refit);
  document.addEventListener("DOMContentLoaded", refit);
  document.addEventListener("load", (e) => e.target instanceof HTMLImageElement && state && refit(), true);

  sheet.replaceSync(BASE_CSS);
  const requested = new URL(location.href).searchParams.get(PARAM);
  if (requested !== null) enter(Math.max(0, (parseInt(requested, 10) || 1) - 1));

  // Add the controls once React has hydrated the document, so hydration never sees them.
  const hydrated = () => Object.keys(document.querySelector("main") ?? {}).some((k) => k.startsWith("__react"));
  const mount = () => {
    if (!hydrated()) return void setTimeout(mount, 100);
    mountUi();
  };
  mount();
})();
