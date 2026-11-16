# CAP-6318 Book

This project contains the source code for the book used in teaching CAP-6318 Computational Analysis of Social Complexity at UCF in Fall 2024.

To build the book run `make build`.

The project's repo is set up to use GitHub pages and host the site contained in the `docs` directory of the main branch.

The `build` Makefile rule will automatically copy the built output into this directory.

The Makefile rule does not execute the notebooks. We assume that the notebooks are already executed and contents are saved within.

## Slide mode

Every lecture page can be presented screen by screen: open it with `?slides` in the URL, click the **Slides** button, or press `s`.
Space, →, ↓, PageDown advance; Shift+Space, ←, ↑, PageUp go back; Home/End jump; `f` toggles fullscreen; Esc leaves.

Slides follow each cell's Jupyter slideshow type (`slide`/`subslide` start a screen, `fragment` reveals on the next advance, `skip`/`notes` are hidden).
A slide that is slightly too tall shrinks to fit; a single cell too tall for one screen (long code or output) is shown in screen-sized pages.
The boundaries in the lectures were placed so every slide fits a 1920×1080 screen; when you add content, check it with `?slides` and move `subslide` boundaries if a slide starts shrinking.

The theme cannot load custom JavaScript, so `scripts/inject_slide_mode.py` adds `slide-mode/slide-mode.js` to the built pages; `make build` runs it before copying to `docs`.
