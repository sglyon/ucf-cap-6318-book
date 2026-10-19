# Printable project handout design

Scope: the standalone CAP 6318 project handout, not the textbook website.
Mode: Read. Students should find requirements, dates, and grading criteria quickly.
The brief prioritizes compact pagination, subtle UCF black/gold, and offline portability.

## Source of truth

`project-2026.md` owns all course content; presentation must leave it unchanged.
`scripts/build_project_handout.py` converts Markdown through Pandoc into browser HTML.
`layout.lua` groups the opening title, course blockquote, and metadata for styling.
`template.html` supplies document controls and embeds styles, fonts, and font licenses.
`handout.css` owns handout overrides after the bundled `foundation.css`.

## Visual tokens

- Typography: Ubuntu Regular/Bold/Italic; JetBrains Mono for code and page counters.
- Gold: `--gold: #ffc904`; light-screen links use dark gold `#765900` for contrast.
- Light ink: `#161616`; print paper: white; screen surfaces follow light/dark mode.
- Rules and secondary ink use restrained neutrals; table headers use pale gold.
- Square panels and CSS hexagons establish the visual character without a university logo.

## Print layout

US Letter uses margins of .45in top, .55in sides, and .5in bottom.
Body type is 9.5pt with 1.27 line height; tables use 8.2pt with 1.28 line height.
Compact spacing preserves hierarchy while minimizing pages; pagination stays automatic.
Headings avoid following breaks, paragraphs keep three widows/orphans, and rows stay intact.
Table headers repeat; page margin boxes carry the course footer and page counter.
Print at 100% scale with browser headers/footers off; print always uses a light scheme.
The reviewed proof `_build/handouts/project-2026.pdf` fits cleanly on four Letter pages.

## Maintenance guardrails

Keep HTML self-contained, including embedded fonts and their licenses; preserve responsive screen controls.
Change presentation assets rather than duplicating content or adding forced page breaks.
After content or layout changes, rebuild and inspect every printed page for clipping, stranded headings, and table splits; browser pagination may vary.
