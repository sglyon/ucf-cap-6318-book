# CAP-6318 Book

This project contains the source code for the book used in teaching CAP-6318 Computational Analysis of Social Complexity at UCF in Fall 2024.

To build the book run `make build`.

The project's repo is set up to use GitHub pages and host the site contained in the `docs` directory of the main branch.

The `build` Makefile rule will automatically copy the built output into this directory.

The Makefile rule does not execute the notebooks. We assume that the notebooks are already executed and contents are saved within.

## Slide mode

Every lecture page can be presented screen by screen: open it with `?slides` in the URL, click the **Slides** button, or press `s`.
Press `?` while presenting for every key. Highlights:

- Space, →, ↓, PageDown advance; Shift+Space, ←, ↑, PageUp go back; `[`/`]` jump between sections; a number then Enter jumps to that slide; `o` opens a clickable outline.
- `d` draws on the slide and `w` opens a blank whiteboard (mouse, trackpad, or pen with pressure). While drawing: `1`–`5` colours, `e` eraser, `u`/⌘Z undo, `c` clear, Esc stops. Ink stays on its slide until the page reloads.
- `b`/`.` black screen, `l` laser pointer, `t` timer and clock (Shift+T restarts it), `+`/`-`/`0` text size (remembered per browser), `f` fullscreen, Esc closes whatever is open and otherwise leaves slide mode.

Slides follow each cell's Jupyter slideshow type (`slide`/`subslide` start a screen, `fragment` reveals on the next advance, `skip`/`notes` are hidden).
A slide that is slightly too tall shrinks to fit; a single cell too tall for one screen (long code or output) is shown in screen-sized pages.
The boundaries in the lectures were placed so every slide fits a 1920×1080 screen; when you add content, check it with `?slides` and move `subslide` boundaries if a slide starts shrinking.

The theme cannot load custom JavaScript, so `scripts/inject_slide_mode.py` adds `slide-mode/slide-mode.js` (and `slide-mode/whiteboard.js`, loaded on first use) to the built pages; `make build` runs it before copying to `docs`.
