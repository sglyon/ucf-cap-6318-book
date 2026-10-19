# Diagram Guide for CAP-6318 Lecture Notes

Conventions for SVG diagrams in CAP-6318 lecture materials. Shared visual language with CAP-6640 in the same MSDA program.

## When to Create Diagrams

Create SVG diagrams for concepts that benefit from visual explanation:

- **Structure diagrams** — network topologies, model components, data flows
- **Process flows** — multi-step pipelines, simulation loops, decision trees
- **Comparisons** — side-by-side contrasts of approaches, models, or equilibria
- **Timelines** — historical progression, adoption/tipping dynamics
- **Conceptual illustrations** — payoff structures, agent-environment loops, two-sided markets

Aim for 2-4 diagrams per lecture part. Use diagrams where they genuinely aid understanding, not as decoration.

## File Organization

- Store SVGs in `weekWW/img/` (e.g., `week08/img/prisoners_dilemma_payoffs.svg`)
- Use lowercase, underscore-separated filenames
- Embed using the native attachment recipe below under **Notebook Downloads** (visible Markdown image cell with `label`/`caption`/`diagram_source` metadata, plus a following notebook-only caption cell tagged `remove-cell`) — that is the single authoritative recipe; do not duplicate or diverge from it here.
- Regenerate the attachment's base64 from the canonical SVG after every edit, and run the mandatory round-trip verification in [`../SKILL.md`](../SKILL.md)'s Workflow step 6 (actual site download, isolated nbconvert, no kernel) before considering a diagram done.

## Notebook Downloads

For notebooks that visitors download from the site, embed each SVG as a base64
`image/svg+xml` markdown-cell attachment. Keep the SVG in `weekWW/img/` as the
editable source. The image cell itself carries only the image, nothing else:

```markdown
![A short description](attachment:diagram_name.svg)
```

Give that cell a stable `id` (for example, `diagram-name`) and metadata:

```json
{
  "label": "fig-descriptive-label",
  "caption": "Caption describing what the diagram shows.",
  "diagram_source": "img/diagram_name.svg"
}
```

MyST resolves the attachment and uses `label` and `caption` to create a numbered
figure. Jupyter renders the attached SVG without a kernel, network access, or
neighboring files. The metadata alone supplies the website's anchor — never add
a `<span>` or `<a>` inside the image cell itself, that duplicates the label.

Two more cells complete the pattern, each independent from the image cell
(never merged into it):

- A **following** Markdown cell with id `diagram-name-caption`, the caption as
  its source, and `{"tags": ["remove-cell"]}` as its metadata. Jupyter displays
  this caption; MyST hides the extra cell to avoid duplication.
- Only when the figure needs a `#fig-descriptive-label` link usable from
  plain-Jupyter prose, a **preceding** Markdown cell with id `diagram-name-anchor`
  and metadata `{"tags": ["remove-cell"]}`, whose source is a valid self-linking
  anchor:

  ```markdown
  <a name="fig-descriptive-label" href="#fig-descriptive-label" tabindex="-1" title="Notebook diagram anchor">&#8203;</a>
  ```

  The explicit `href` gives MyST's link parser a URL (otherwise it flags a
  "Link has no URL" diagnostic), `tabindex="-1"` keeps it out of the notebook's
  tab order, and `remove-cell` keeps it off the built site, which already has
  the metadata-supplied anchor. Omit this cell entirely when nothing needs to
  link to the figure by id.

Use nonempty reference text, such as `[the diagram below](#fig-descriptive-label)`,
so references remain visible in standard Jupyter too.

Run `uv run python scripts/sync_diagram_attachments.py` after editing SVGs or
captions and before a direct MyST build. `make build` and `make run` do this
automatically. The script refreshes attachments and notebook-only captions from
the source SVGs and figure metadata. PNG, JPEG, GIF, and WebP figures can use the
same recipe with their matching MIME types. For ordinary Markdown images within
a prose cell, store their files in `img/`, use `attachment:filename.png` in the
image link, and record `"attachment_sources": {"filename.png": "img/filename.png"}`
in cell metadata. These images do not need figure or caption metadata. Preserve
original remote URLs in `attachment_source_urls` (or `diagram_source_url` for a
figure), along with any existing attribution in the prose or caption.

Validate the actual `.ipynb` files linked by each built page's
`frontmatter.exports`: open an isolated copy in Jupyter, or render it with
nbconvert and check that every diagram is an embedded SVG image. Also verify
that the website still has one caption per figure and resolved cross-references.

## Visual Style Conventions

### Colors

Consistent color scheme across all diagrams (Tailwind CSS palette). Suggested topic assignments for CAP-6318:

| Concept | Primary | Light Fill | Dark Text |
|---------|---------|------------|-----------|
| Networks / graphs | `#3B82F6` | `#DBEAFE` / `#EFF6FF` | `#1E40AF` |
| Game theory / strategy | `#F59E0B` | `#FEF3C7` / `#FFFBEB` | `#92400E` |
| ABM / simulation | `#10B981` | `#D1FAE5` / `#ECFDF5` | `#065F46` |
| AI agents / neutral | `#7C3AED` | `#EDE9FE` | `#5B21B6` |
| Background | `#FFFFFF` | — | — |
| Title text | `#1E293B` | — | — |
| Body text | `#475569` | — | — |
| Muted/disabled | `#94A3B8` | `#E2E8F0` | `#CBD5E1` |

Within a single diagram, use color to distinguish concepts — the topic assignments are defaults, not hard rules. Stay inside this palette.

### Typography

```xml
font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
```

- Titles: `font-size="18-20"`, `font-weight="700"`, fill `#1E293B`
- Section headers: `font-size="13-15"`, `font-weight="600"`
- Body text: `font-size="10-12"`, fill `#475569`
- Labels/captions: `font-size="8-10"`, fill varies by context

### Layout Patterns

- **Card-based layout**: Rounded rectangles (`rx="12"`) with colored header bars and light fills. Use drop shadows for depth.
- **Drop shadow filter** (include in `<defs>`):
  ```xml
  <filter id="shadow" x="-4%" y="-4%" width="108%" height="108%">
    <feDropShadow dx="1" dy="2" stdDeviation="3" flood-opacity="0.12"/>
  </filter>
  ```
- **Arrows**: Use `<marker>` definitions for arrowheads. Color-match to the concept being illustrated.
- **Pill badges**: Rounded rectangles (`rx="13"`) with light fills and 1px borders for short labels.
- **Crossed-out elements**: Dashed borders (`stroke-dasharray="4,2"`) and X lines for disabled/removed components.
- **Network nodes**: Circles with light fills and 1.5px primary-color strokes; edges as 1.5px lines in the muted color unless the edge itself is the point.

### ViewBox Sizing

| Type | Suggested ViewBox | Notes |
|------|------------------|-------|
| Wide comparison (3 columns) | `960x530` | Three side-by-side cards |
| Horizontal flow | `850x350` | Pipeline or process steps |
| Vertical flowchart | `700x500` | Decision trees |
| Timeline | `800x300` | Horizontal progressions |
| Two-panel comparison | `850x450` | Stacked or side-by-side |

Always use white background: `<rect width="W" height="H" rx="12" fill="#FFFFFF"/>`

## SVG Template

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 WIDTH HEIGHT"
     width="WIDTH" height="HEIGHT"
     font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif">
  <defs>
    <filter id="shadow" x="-4%" y="-4%" width="108%" height="108%">
      <feDropShadow dx="1" dy="2" stdDeviation="3" flood-opacity="0.12"/>
    </filter>
    <!-- Add marker definitions for arrows as needed -->
  </defs>

  <!-- Background -->
  <rect width="WIDTH" height="HEIGHT" rx="12" fill="#FFFFFF"/>

  <!-- Title -->
  <text x="CENTER_X" y="38" text-anchor="middle" font-size="20"
        font-weight="700" fill="#1E293B">Diagram Title</text>

  <!-- Content goes here -->
</svg>
```

## Validation

After creating any SVG, validate it visually before embedding. Check for:

- No text clipping or overflow
- No overlapping elements
- Proper spacing between cards/sections
- Readable font sizes
- Correct color usage per conventions above
- Explicit `width`/`height` attributes on the `<svg>` root matching the `viewBox` dimensions — without them browsers report a ~237–300px natural size, so the image renders too small wherever intrinsic size is used (including the downloaded-notebook attachment)

## Reference Examples

Three example SVGs in this directory serve as style templates:

1. **`three_philosophies.svg`** — Card-based comparison (3 columns with header bars, mini diagrams, pills, branching arrows)
2. **`architecture_flowchart.svg`** — Decision tree with diamond nodes, colored terminal boxes, Yes/No labeled arrows
3. **`pipeline_three_steps.svg`** — Horizontal flow with connected stages, code-style footer
