# Printable project handout

The Markdown is the source of truth. The generator uses Python 3's standard
library and Pandoc (tested with Pandoc 3.12.1); no Python packages, JavaScript
build tools, network access, or local font installation are needed.

```sh
python3 scripts/build_project_handout.py
```

The default output is
`~/artifacts/sglyon/ucf-cap-6318-book/handouts/project-2026.html`.
Choose another destination with `-o`, or use the ignored build directory:

```sh
python3 scripts/build_project_handout.py -o _build/handouts/project-2026.html
# Equivalent Make target:
make project-handout
```

Open the HTML in a browser and choose **Print / save PDF**. Use US Letter,
100% scale, and turn off the browser's own headers and footers. Chrome/Edge
support the stylesheet's page numbers and course footer. Background graphics
preserve the pale gold table headers; the text remains readable without them.
Print always uses a white background, regardless of the screen color scheme.
Pagination may vary across browsers.

The Lua filter styles the initial H1, course blockquote, and metadata paragraph.
It fails with a clear message if that opening structure changes. Everything else
is converted directly by Pandoc. Customize `handout.css` and `template.html` to
reuse the design. The bundled foundation stylesheet is followed by UCF palette
and type overrides. No content is copied into a second hand-maintained document.

## Fonts

Font files are embedded into the output HTML so it is fully portable offline.
The original license files are included alongside them:

- Ubuntu Regular, Bold, Italic: Ubuntu Font Licence (`fonts/UFL.txt`),
  from <https://github.com/google/fonts/tree/main/ufl/ubuntu>.
- JetBrains Mono Regular: SIL Open Font License (`fonts/OFL.txt`),
  from <https://github.com/JetBrains/JetBrainsMono>.

Gold is `#FFC904`; dark gold is used for links on white to preserve contrast.
The hexagons are decorative CSS geometry; no university logo is reproduced.
