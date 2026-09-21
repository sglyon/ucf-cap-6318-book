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
- Embed in lecture notebooks (markdown cells) using the MyST figure directive:

````markdown
```{figure} img/diagram_name.svg
:label: fig-descriptive-label
:width: 95%
:align: center

Caption describing what the diagram shows.
```
````

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

## Reference Examples

Three example SVGs in this directory serve as style templates:

1. **`three_philosophies.svg`** — Card-based comparison (3 columns with header bars, mini diagrams, pills, branching arrows)
2. **`architecture_flowchart.svg`** — Decision tree with diamond nodes, colored terminal boxes, Yes/No labeled arrows
3. **`pipeline_three_steps.svg`** — Horizontal flow with connected stages, code-style footer
