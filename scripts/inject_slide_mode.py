"""Add slide mode to a built MyST site.

book-theme has no hook for custom JavaScript, so after `myst build --html` this copies
`slide-mode/slide-mode.js` (and the whiteboard module it loads on demand) into the site root
and loads it from every page's <head>.
Safe to run repeatedly on the same build.
"""

from __future__ import annotations

import argparse
import hashlib
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = {  # site asset -> source; slide-mode.js imports the whiteboard by this asset name
    "slide-mode.js": ROOT / "slide-mode" / "slide-mode.js",
    "slide-mode-whiteboard.js": ROOT / "slide-mode" / "whiteboard.js",
}
ASSET = "slide-mode.js"
TAG_RE = re.compile(r'<script src="[^"]*' + re.escape(ASSET) + r'\?v=[0-9a-f]+"></script>')


def inject(site: Path) -> int:
    digest = hashlib.sha256()
    for asset, source in SOURCES.items():
        digest.update(source.read_bytes())
        shutil.copyfile(source, site / asset)
    version = digest.hexdigest()[:10]
    count = 0
    for page in site.rglob("index.html"):
        depth = len(page.relative_to(site).parts) - 1
        tag = f'<script src="{"../" * depth}{ASSET}?v={version}"></script>'
        html = TAG_RE.sub("", page.read_text())
        if "</head>" not in html:
            continue
        page.write_text(html.replace("</head>", tag + "</head>", 1))
        count += 1
    return count


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("site", nargs="?", default=ROOT / "_build" / "html", type=Path)
    args = parser.parse_args()
    print(f"slide mode: injected into {inject(args.site)} pages")


if __name__ == "__main__":
    main()
