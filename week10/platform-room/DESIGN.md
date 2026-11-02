# Platform Room interface

This app extends the week09 Auction Room classroom interface and keeps its three-role architecture. The student and instructor views are task-focused; the projector prioritizes room-scale reading, phone entry, and the two hand-drawn charts (cobweb diagram / phase plot).

Use the inherited warm off-white background, white panels with one thin border, system sans-serif text, charcoal foreground, muted gray supporting copy, and blue actions. Green confirms accepted actions; red names an error and recovery. Adoption shares and prices use tabular numerals. Large type is reserved for the round status, realized share(s), and countdown. A second accent color (amber/orange, `--marketB`) distinguishes Market B / Restaurants from Market A / Diners (`--marketA`, the inherited blue) wherever two series share one chart or legend.

Students have a narrow single-column page: a persistent identity/score line, the round's market or side, their private taste $x$ (shown nowhere else), the announced expectation, the computed value of joining, two large Join/Stay-out buttons, and the previous round's result. The instructor has the round controls, mode switch, and mode-specific settings (market prices/$n^e$ or price-structure level/slider/presets) on the left, with the players table (private — the only place $x$ is shown), round history, and session management on the right. The projector shows round status, big realized-share numbers, and the relevant chart on the left, with a collapsible join QR/URL panel and room roster on the right. At 700px and below these columns stack; short projectors reduce type and chart size to keep the current result readable.

Controls have visible labels, 48px minimum height, keyboard focus outlines, validation, disabled states, and inline live feedback. No modal or auto-advance interrupts discussion. A round snapshots its settings at start, so editing a price or $n^e$ mid-round visibly has no effect until the next round — this is enforced by disabling those inputs while a round is running. Server deadlines and the authoritative round state govern actions; the browser countdown is informational.

## Charts

Both charts are hand-drawn inline SVG built from short coordinate-generating functions in `common.js` — no canvas library, no charting package, no CDN. They share one coordinate convention: a padded unit square `[0,1]×[0,1]` with `(0,0)` at the bottom-left.

- **Cobweb / staircase diagram** (Walk the Line): the always-visible $g(n^e;p)$ curve, the 45° line, a dashed per-round staircase built from the market's actual history, and — only after the instructor clicks **Reveal theory** — open circles at the curve's fixed points with the unstable $n_L$ labeled. Two markets overlay in their accent colors on one chart.
- **Phase plot** (Price Structure): the actual $(n_D, n_R)$ trajectory connected by a solid line, and — after Reveal — a dashed red trajectory from the deterministic stratified-rational-play simulation starting at the same point, so the class can compare the room's play to theory. The seesaw is a separate small SVG showing the structure slider and the constant price level $L$.

The QR renderer is copied with its license from Auction Room. There are no external font, image, CSS, JavaScript, or QR services. Verify the current round, both charts (including after Reveal), the join QR, the student taste/value line, and the instructor controls whenever changing the shared styles.
