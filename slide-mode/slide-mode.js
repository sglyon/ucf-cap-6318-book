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
// Enter: `?slides` in the URL, the "Slides" button, or the `s` key.
// Next: Space, →, ↓, PageDown, Enter.  Back: Shift+Space, ←, ↑, PageUp, Backspace.
// Home/End jump to the first/last slide, `f` toggles fullscreen, Esc or `s` leaves slide mode.
//
// The theme is a hydrated React app, so this script never edits React-owned markup: it removes
// its own <script> tag before hydration, styles the page only through an adopted stylesheet,
// and appends its single control after the page has hydrated.
(() => {
  const script = document.currentScript;
  const base = new URL(".", script.src);
  script.remove();

  const PAD = 24; // px of breathing room above and below a slide
  const MIN_ZOOM = 0.75; // smallest shrink that keeps text readable from the back of a room
  const PARAM = "slides";

  const sheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

  const BASE_CSS = `
    .myst-slides-control {
      position: fixed; right: 16px; bottom: 16px; z-index: 60;
      font: 600 13px/1 system-ui, sans-serif; padding: 8px 12px; border-radius: 6px;
      border: 1px solid rgb(148 163 184 / .5); background: rgb(255 255 255 / .85); color: #1e293b;
      cursor: pointer; opacity: .55; transition: opacity .15s;
    }
    .myst-slides-control:hover { opacity: 1; }
    .dark .myst-slides-control { background: rgb(30 41 59 / .85); color: #e2e8f0; }
    @media print { .myst-slides-control { display: none; } }
  `;

  // Styles active only while presenting; `selectors` are the blocks on the current step and
  // `page` ({ height }) clips the slide to one screen-sized window.
  // Sizing follows RISE (1024x768 scaled to the screen): text scales with viewport width and a
  // slide is 64rem wide, so a 1920x1080 screen shows 22px text in a 1408px column.
  const slideCss = (selectors, zoom, page) => `
    ${BASE_CSS}
    html { font-size: 1.15vw !important; scroll-behavior: auto !important; }
    html, body { overflow: hidden !important; }
    body > :not(main):not(.myst-slides-control):not(dialog) { display: none !important; }
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
  // { slug, slides, index, step, page, windows }: `windows` are the screen-sized pages of the
  // current step when it is too tall to shrink, else null.
  let state = null;
  let control = null;

  const slugFor = (loc) => loc.pathname.slice(base.pathname.length).replace(/\/(index\.html)?$/, "") || "index";

  const isHeading = (block) => block.children?.[0]?.type === "heading" && block.children[0].depth <= 3;

  // Group top-level notebook blocks into slides; fragments become numbered steps within a slide.
  const buildSlides = (blocks) => {
    const typeOf = (b) => b.data?.slideshow?.slide_type;
    const tagged = blocks.some(typeOf);
    const slides = [];
    let current = null;
    for (const block of blocks) {
      const id = block.html_id || block.identifier || block.key; // the theme's DOM id for the block
      const type = tagged ? typeOf(block) : isHeading(block) ? "slide" : "-";
      if (!id || type === "skip" || type === "notes") continue;
      if (!current || ((type === "slide" || type === "subslide") && current.blocks.length)) {
        current = { blocks: [], steps: 0 };
        slides.push(current);
      }
      if (type === "fragment" && current.blocks.length) current.steps += 1;
      current.blocks.push({ id, step: current.steps });
    }
    return slides;
  };

  const loadSlides = (slug) => {
    if (!pages.has(slug)) {
      const blocks = fetch(new URL(`${slug}.json`, base))
        .then((r) => (r.ok ? r.json() : null))
        .then((page) => (page?.mdast?.children ?? []).filter((b) => b.type === "block"))
        .catch(() => []);
      pages.set(slug, blocks.then(buildSlides));
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
    state.page = state.page === "end" ? state.windows.length - 1 : Math.min(state.page, state.windows.length - 1);
    const page = state.windows[state.page];
    sheet.replaceSync(slideCss(selectors, 1, page));
    article.scrollTop = page.top;
  };

  const updateControl = () => {
    if (!control) return;
    const windows = state?.windows;
    control.textContent = !state
      ? "Slides"
      : `${state.index + 1} / ${state.slides.length}` + (windows ? ` · ${state.page + 1}/${windows.length}` : "");
    control.title = state ? "Esc to leave slide mode" : "Present this page as slides (s)";
  };

  // `page` is a window index within the step, or "end" for its last window.
  const go = (index, step, page = 0) => {
    state.index = Math.max(0, Math.min(state.slides.length - 1, index));
    state.step = step === "end" ? state.slides[state.index].steps : step;
    state.page = page;
    fit();
    window.scrollTo(0, 0);
    setUrl(state.index);
    updateControl();
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

  const enter = async (index = 0) => {
    const slug = slugFor(location);
    const slides = await loadSlides(slug);
    if (!slides.length) return;
    state = { slug, slides, index: 0, step: 0, page: 0, windows: null };
    go(index, 0);
  };

  const exit = () => {
    if (!state) return;
    const first = state.slides[state.index].blocks[0]?.id;
    state = null;
    sheet.replaceSync(BASE_CSS);
    setUrl(null);
    updateControl();
    if (document.fullscreenElement) document.exitFullscreen();
    if (first) document.getElementById(first)?.scrollIntoView();
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  const typing = (target) =>
    target instanceof Element &&
    target.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']");

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || typing(event.target)) return;
      if (!state) {
        if (event.key === "s") {
          event.preventDefault();
          enter();
        }
        return;
      }
      const actions = {
        " ": () => (event.shiftKey ? prev() : next()),
        ArrowRight: next,
        ArrowDown: next,
        PageDown: next,
        Enter: next,
        ArrowLeft: prev,
        ArrowUp: prev,
        PageUp: prev,
        Backspace: prev,
        Home: () => go(0, 0),
        End: () => go(state.slides.length - 1, "end", "end"),
        Escape: exit,
        s: exit,
        f: toggleFullscreen,
      };
      const action = actions[event.key];
      if (!action) return;
      event.preventDefault();
      event.stopPropagation();
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
    state = { slug, slides, index: 0, step: 0, page: 0, windows: null };
    go(0, 0);
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

  // Add the control once React has hydrated the document, so hydration never sees it.
  const hydrated = () => Object.keys(document.querySelector("main") ?? {}).some((k) => k.startsWith("__react"));
  const mount = () => {
    if (!hydrated()) return void setTimeout(mount, 100);
    control = document.createElement("button");
    control.type = "button";
    control.className = "myst-slides-control";
    control.addEventListener("click", () => state || enter());
    document.body.appendChild(control);
    updateControl();
  };
  mount();
})();
