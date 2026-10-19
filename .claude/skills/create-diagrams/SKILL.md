---
name: create-diagrams
description: "Create SVG diagrams for CAP-6318 lecture materials in the course's house style (card layouts, Tailwind palette, Segoe UI). Use when the user asks for a diagram, figure, flowchart, comparison, timeline, or visual illustration of a lecture concept."
---

# Create Diagrams (CAP-6318)

## Role

You create hand-authored SVG diagrams for CAP-6318 lecture notebooks, matching the visual style established in CAP-6640 (same MSDA program): white cards with rounded corners, drop shadows, Tailwind palette colors, and clean typography.

## Required Reading

1. `references/diagram-guide.md` (in this skill's directory) — colors, typography, layout, viewBox conventions
2. The example SVGs in `references/` — use as style templates:
   - `three_philosophies.svg` — card-based 3-column comparison
   - `architecture_flowchart.svg` — decision tree with diamond nodes
   - `pipeline_three_steps.svg` — horizontal flow diagram

## Workflow

1. **Scope**: Confirm what the diagram must communicate in one sentence. If the concept doesn't fit one sentence, it's two diagrams.
2. **Pick a layout**: comparison cards, flowchart, pipeline, timeline, or two-panel — per the guide's viewBox table.
3. **Author the SVG** at `weekWW/img/descriptive_name.svg` (lowercase, underscores). Follow the guide's template, palette, and typography exactly. For a quantitative/generated plot, keep a reproducible generator script (e.g. a `.jl` file) beside the SVG using the project's existing dependencies — run the generator to (re)produce the SVG before embedding it; the SVG is still the canonical file and the sole source of the attachment bytes, so no execution is needed when the notebook is later downloaded.
4. **Validate visually** — this step is mandatory:
   - Read the SVG file with the `:img` selector (rasterizes to PNG) and inspect it, or open it in a browser tab and screenshot.
   - Check: no text clipping/overflow, no overlapping elements, readable font sizes, correct palette, proper spacing.
   - Fix and re-check until clean.
5. **Embed** in the lecture notebook using the native attachment recipe in `references/diagram-guide.md` under **Notebook Downloads** — a visible Markdown image cell (`attachment:basename.svg`) carrying the canonical SVG as a base64 attachment, plus metadata (`label`, `caption`, `diagram_source`) that MyST resolves into a numbered figure on the site. This is the single authoritative recipe: it needs no sibling `img/` directory and no separate site-only figure directive, because both the website and the downloaded `.ipynb` render the same attachment.

   ````markdown
   ![A short description](attachment:diagram_name.svg)
   ````

   with metadata `{"label": "fig-descriptive-label", "caption": "Caption describing what the diagram shows.", "diagram_source": "img/diagram_name.svg"}`. The image cell's metadata alone supplies the website's anchor — never add a `<span>` or `<a>` inside the image cell itself, that duplicates the label. `id` is required by nbformat 4.5+ and must be a unique cell id matching the convention already used by the surrounding notebook's cells.

   Two more cells complete the pattern, each independent (never merged into the image cell):

   - A **following** notebook-only caption cell (id `diagram-name-caption`, source equal to the caption, metadata `{"tags": ["remove-cell"]}`) so plain Jupyter still shows the caption while MyST hides the duplicate.
   - Only when the figure needs a `#fig-descriptive-label` link usable from plain-Jupyter prose, a **preceding** notebook-only anchor cell (id `diagram-name-anchor`, metadata `{"tags": ["remove-cell"]}`, source `<a name="fig-descriptive-label" href="#fig-descriptive-label" tabindex="-1" title="Notebook diagram anchor">&#8203;</a>`) — the explicit `href` gives MyST's link parser a URL, `tabindex="-1"` keeps it off the notebook's tab order, and `remove-cell` keeps it off the built site (which already has the metadata-supplied anchor). Omit this cell entirely when nothing links to the figure by id.

   See the guide's **Notebook Downloads** section for the full three-cell pattern, including ordinary (non-figure) images and attribution metadata.

   Create the cells first (by hand or from the templates above), then run `uv run python scripts/sync_diagram_attachments.py` (also run automatically by `make build` and `make run`) after creating or editing the SVG, caption, or `diagram_source` — it refreshes the attachment payload from the canonical SVG and the caption cell's source from `metadata.caption`, it does not create the cells themselves. Never hand-type the base64 attachment or maintain the caption text as an independent copy.

6. **Verify the full round trip — mandatory, not satisfied by an HTML build alone**:

   1. Run `uv run python scripts/sync_diagram_attachments.py` so attachments and captions match the source SVGs, then `uv run myst build --html` — exit 0, each figure renders exactly once on the page with its caption, no kernel placeholder or duplicate image visible.
   2. From the rendered page, use the site's actual Download button to fetch the `.ipynb` (not the repository source file) into an empty scratch directory containing no `img/` folder.
   3. Convert it with the project's nbconvert (e.g. `uv run jupyter nbconvert --to html <downloaded>.ipynb`) in that isolated directory, without executing the notebook and without network access. Each diagram must appear as a self-contained base64 image, byte-identical to the source SVG, rendered readable at its intended size (not shrunk to the ~237–300px natural size browsers use when an SVG lacks explicit `width`/`height` attributes — see the guide's SVG Template rule), with its caption visible exactly once.
   4. Confirm each diagram appears exactly once in each context: once in the built site, once in the offline-rendered download — never duplicated, never missing.

   A bare relative `img/...` reference, a check confined to the MyST HTML build, or a check that stops before step 2 does not satisfy this — the downloaded notebook is a standalone file with no sibling `img/` directory, so this recipe requires the embedded attachment rather than relying on repository-relative paths.

## Placement and Quantity

- 2-4 diagrams per lecture part; only where a visual genuinely aids understanding.
- Place each diagram immediately after the concept it illustrates, before code examples.
- Reference figures in prose via meaningful, nonempty link text, e.g. `[the diagram below](#fig-descriptive-label)` — never an empty `[](#fig-descriptive-label)`.
