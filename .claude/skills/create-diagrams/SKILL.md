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
3. **Author the SVG** at `weekWW/img/descriptive_name.svg` (lowercase, underscores). Follow the guide's template, palette, and typography exactly.
4. **Validate visually** — this step is mandatory:
   - Read the SVG file with the `:img` selector (rasterizes to PNG) and inspect it, or open it in a browser tab and screenshot.
   - Check: no text clipping/overflow, no overlapping elements, readable font sizes, correct palette, proper spacing.
   - Fix and re-check until clean.
5. **Embed** in the lecture notebook (markdown cell) with a MyST figure directive:

   ````markdown
   ```{figure} img/diagram_name.svg
   :label: fig-descriptive-label
   :width: 95%
   :align: center

   Caption describing what the diagram shows.
   ```
   ````

6. If the notebook is in the site, confirm `uv run myst build --html` renders the figure without warnings.

## Placement and Quantity

- 2-4 diagrams per lecture part; only where a visual genuinely aids understanding.
- Place each diagram immediately after the concept it illustrates, before code examples.
- Reference figures in prose via `[](#fig-descriptive-label)`.
