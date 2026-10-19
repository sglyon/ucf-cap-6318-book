#!/usr/bin/env python3
"""Build an offline, print-ready course handout with Python 3 and Pandoc."""

import argparse
import base64
import html
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "scripts" / "handout"
DEFAULT_OUTPUT = (
    Path.home() / "artifacts/sglyon/ucf-cap-6318-book/handouts/project-2026.html"
)


def build(source: Path, output: Path) -> None:
    if not shutil.which("pandoc"):
        raise RuntimeError("Pandoc is required. Install it from https://pandoc.org/installing.html")
    if not source.is_file():
        raise RuntimeError(f"Markdown source not found: {source}")
    if source.resolve() == output.resolve():
        raise RuntimeError("Output must differ from the Markdown source")
    font_rules = []
    for filename, family, weight, style in [
        ("Ubuntu-Regular.ttf", "Ubuntu", 400, "normal"),
        ("Ubuntu-Bold.ttf", "Ubuntu", 700, "normal"),
        ("Ubuntu-Italic.ttf", "Ubuntu", 400, "italic"),
        ("JetBrainsMono-Regular.ttf", "JetBrains Mono", 400, "normal"),
    ]:
        encoded = base64.b64encode((ASSETS / "fonts" / filename).read_bytes()).decode("ascii")
        font_rules.append(
            f'@font-face {{ font-family: "{family}"; font-weight: {weight}; '
            f'font-style: {style}; src: url("data:font/ttf;base64,{encoded}") format("truetype"); }}'
        )
    # Inline assets before Pandoc sees the template, preserving CSS verbatim.
    # Pandoc handles all Markdown parsing; its $body$ slot stays in the template.
    with tempfile.TemporaryDirectory(prefix="cap6318-handout-") as scratch:
        scratch = Path(scratch)
        template = (ASSETS / "template.html").read_text()
        for marker, value in {
            "$foundation$": (ASSETS / "foundation.css").read_text(),
            "$fonts$": "\n".join(font_rules),
            "$handout-css$": (ASSETS / "handout.css").read_text(),
            "$font-licenses$": html.escape("\n\n".join(
                (ASSETS / "fonts" / name).read_text() for name in ("UFL.txt", "OFL.txt")
            )),
        }.items():
            template = template.replace(marker, value)
        template_path = scratch / "template.html"
        template_path.write_text(template, encoding="utf-8")
        rendered = scratch / "handout.html"
        subprocess.run([
            "pandoc", str(source), "--from=gfm", "--to=html5", "--standalone",
            "--section-divs", f"--lua-filter={ASSETS / 'layout.lua'}",
            f"--template={template_path}", "--metadata=pagetitle:Course Project · CAP 6318 · Fall 2026",
            f"--output={rendered}",
        ], check=True)
        output.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(rendered, output)
    print(f"Built {output}")
    print("Open in a browser, then Print / save PDF. Use Letter, 100% scale, and disable browser headers/footers.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", nargs="?", type=Path, default=ROOT / "project-2026.md")
    parser.add_argument("-o", "--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    try:
        build(args.source.expanduser().resolve(), args.output.expanduser().resolve())
    except (OSError, RuntimeError, subprocess.CalledProcessError) as exc:
        print(f"Build failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
