---
name: create-widgets
description: "Add interactive anywidget components (sliders, games, network/ABM visualizations, matching-market demos) to CAP-6318 lecture notebooks. Use when the user asks for an interactive teaching component, browser-side demo, or anywidget in a lecture. Widgets render on the static GitHub Pages site with no Python kernel."
---

# Create Widgets (CAP-6318)

## What Works (spike-verified 2026-09-21, mystmd v1.11.0)

An anywidget-compatible `.mjs` module placed beside a lecture notebook, embedded from a **markdown cell** with the `{anywidget}` directive, renders fully interactively on the MyST-built static site. Verified end-to-end: notebook markdown cell → `myst build --html` → static export served with no kernel → button clicks mutate widget state in the browser.

**Hard constraint:** deployed widgets run browser-side JavaScript only. No Python callbacks, no kernel. All simulation/game/visualization logic must live in the `.mjs` module.

## Recipe

1. **Write the module** at `weekWW/widget_name.mjs` (beside the notebook). Required shape:

   ```javascript
   function render({ model, el }) {
     // build DOM, append to el
     return () => { /* optional cleanup on page navigation */ };
   }
   export default { render };
   ```

   Model API (state lives in the model, initialized from the directive body):
   - `model.get("key")` — read
   - `model.set("key", value)` then `model.save_changes()` — write
   - `model.on("change:key", cb)` — react

   See `references/counter.mjs` in this skill's directory for a complete working example (the spike widget).

2. **Embed** in a markdown cell of the `.ipynb` (JSON body sets initial model state):

   ````markdown
   ```{anywidget} ./widget_name.mjs
   {
     "count": 0
   }
   ```
   ````

   Path is relative to the notebook. MyST bundles the module into the page payload automatically — no `myst.yml` changes, no `static_files` entry.

3. **Optionally style** with a sibling stylesheet via the `:css:` option:

   ````markdown
   ```{anywidget} ./widget_name.mjs
   :css: ./widget_name.css
   { "count": 0 }
   ```
   ````

   Or inline styles via `Object.assign(node.style, {...})` in the module. Use the course palette from the `create-diagrams` skill's diagram guide (e.g., `#3B82F6`/`#DBEAFE`/`#1E40AF` for networks).

## Rendering Details

- The widget mounts in a **Shadow DOM** under `div.myst-anywidget`. Page CSS does not leak in; widget CSS does not leak out. When inspecting programmatically, query `document.querySelector("div.myst-anywidget").shadowRoot`.
- `render` may return a cleanup function — always do this for timers/animation loops (ABM tick loops!) or they keep running after page navigation.
- Widgets are self-contained; the same widget can be reused across pages via the `{embed}` directive.

## Validation (mandatory before claiming done)

1. `uv run myst build --html` — exit 0, no directive warnings.
2. Serve the static export exactly as GitHub Pages will:

   ```bash
   python3 -m http.server 8123 --directory _build/html
   ```

3. Open the page in a browser, interact with the widget (click/drag/slide), and confirm state updates. A DOM check must pierce the shadow root:

   ```javascript
   const host = document.querySelector("div.myst-anywidget");
   host.shadowRoot.querySelector("button").click();
   ```

4. Stop the server; if publishing, run `make build` to sync `_build/html/` → `docs/`.

## Downloaded Notebooks (spike-verified 2026-09-21)

The site's download button serves the **source `.ipynb` only** (a hashed copy under `_build/html/build/`); sibling `.mjs` files do not travel with it. In Jupyter, the `{anywidget}` directive cell renders as an inert code block — the directive is site-only.

If a demo must also work in the downloaded notebook, add a **code cell** with a Python `anywidget.AnyWidget` class alongside the directive. **Runtime prerequisite:** this path only works with a live kernel and `anywidget` installed in the student's environment (`pip install anywidget`) — URL/inline `_esm` alone does not make the notebook runnable in a stock Jupyter install. This repo's own environment deliberately does NOT depend on `anywidget`; spike validation used ephemeral installs (`uv run --with anywidget ...`) — do not add it to `pyproject.toml` without Spencer's explicit ask. Verified behavior of the `_esm` forms (JupyterLab 4, anywidget via `uv run --with anywidget`):

1. **URL** — `_esm = "https://ucf-cap-6318.spencerlyon.com/widget_name.mjs"`. Renders and syncs through the kernel (clicks verified). Requires: (a) the `.mjs` listed under `project.static_files` in `myst.yml`, which copies it verbatim to the site root for a stable URL (verified in `_build/html/`), and (b) CORS — the host MUST send `Access-Control-Allow-Origin` or the front-end's module import silently renders nothing (observed with plain `http.server`; the live course site on GitHub Pages returns `access-control-allow-origin: *`, checked 2026-09-21). Recommended: one source of truth, needs network. After deploying, `curl -sI` the `.mjs` URL to confirm it serves with the CORS header before relying on it.
2. **Inline string** — `_esm = """function render({ model, el }) {...}"""`. Fully self-contained after download; duplicates the module source. Use when offline execution matters.
3. **`pathlib.Path("widget_name.mjs")`** — works only where the sibling file exists (this repo). Broken in a downloaded notebook; authoring convenience only.

State is shared via `traitlets` with `sync=True`:

```python
import anywidget, traitlets

class Counter(anywidget.AnyWidget):
    _esm = "https://ucf-cap-6318.spencerlyon.com/counter.mjs"
    count = traitlets.Int(0).tag(sync=True)

Counter(count=0)
```

**On the static site this code cell does NOT hydrate** — it shows an "ipywidgets - a Jupyter kernel connection is required" placeholder (verified). So the directive and the code cell are complementary, not alternatives: directive = site, code cell = downloaded notebook. To keep the placeholder off the site, tag the code cell `remove-cell` — but note that also strips it from the rendered page, while the download still contains it; `hide-cell` collapses it instead (MyST cell-tag docs: https://mystmd.org/guide/notebook-configuration).

## Pedagogical Fit

Good widget candidates in this course: parameter sliders driving a plotted curve, Schelling/ABM grid simulations (JS tick loop), network formation/contagion demos, game-theory payoff explorers, matching-market (deferred acceptance) walkthroughs, platform tipping-point dynamics. Keep each widget focused on one manipulable idea; put the lesson in the lecture prose, not the widget.

## References

- MyST widgets guide: https://mystmd.org/guide/widgets
- anywidget authoring docs: https://anywidget.dev/
- `references/counter.mjs` — verified working module from the spike
