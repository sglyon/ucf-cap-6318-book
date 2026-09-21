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

## Pedagogical Fit

Good widget candidates in this course: parameter sliders driving a plotted curve, Schelling/ABM grid simulations (JS tick loop), network formation/contagion demos, game-theory payoff explorers, matching-market (deferred acceptance) walkthroughs, platform tipping-point dynamics. Keep each widget focused on one manipulable idea; put the lesson in the lecture prose, not the widget.

## References

- MyST widgets guide: https://mystmd.org/guide/widgets
- anywidget authoring docs: https://anywidget.dev/
- `references/counter.mjs` — verified working module from the spike
