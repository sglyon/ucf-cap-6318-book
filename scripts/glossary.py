"""Course glossary: render glossary.md, validate links, and auto-link {term} references.

Source of truth is ``glossary/terms.toml``. See ``glossary.md``'s generation rules in
this file's docstrings and the course glossary contract for the exact format.
"""

from __future__ import annotations

import argparse
import difflib
import json
import re
import sys
import tomllib
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
TERMS_PATH = ROOT / "glossary" / "terms.toml"
GLOSSARY_PATH = ROOT / "glossary.md"
MYST_PATH = ROOT / "myst.yml"

VALID_SCOPE_LITERALS = {"all", "unit"}

# --- Text patterns used to find/exclude regions when scanning markdown cells. ---

HEADING_RE = re.compile(r"^[ \t]*#{1,6}[ \t].*$", re.MULTILINE)
INLINE_CODE_RE = re.compile(r"`[^`\n]*`")
MATH_BLOCK_RE = re.compile(r"\$\$.*?\$\$", re.DOTALL)
MATH_INLINE_RE = re.compile(r"\$[^$\n]+\$")
ROLE_RE = re.compile(r"\{[A-Za-z][\w-]*\}`[^`]*`")
LINK_RE = re.compile(r"!?\[[^\]\n]*\]\([^)\n]*\)")
HTML_TAG_RE = re.compile(r"<[^>\n]+>")
URL_RE = re.compile(r"https?://[^\s)\]]+")
TERM_ROLE_RE = re.compile(r"\{term\}`([^`]*)`")
ROLE_START_RE = re.compile(r"\{([A-Za-z][\w-]*)\}(`*)")
ANCHOR_CELL_RE = re.compile(r"^\(sec-[\w-]+\)=\s*$")

# Role names that look like a typo'd {term} reference or a block directive misused inline.
TERM_LOOKALIKE_RE = re.compile(r"^[Tt][Ee][Rr][Mm][Ss]$")


# ----------------------------------------------------------------------------
# Loading
# ----------------------------------------------------------------------------


def load_toc_notebooks(myst_path: Path | None = None) -> list[str]:
    """Return lecture notebook paths from myst.yml's `toc`, in TOC order.

    Excludes week00 (front matter) and non-notebook entries (e.g. glossary.md).
    """
    myst_path = myst_path if myst_path is not None else MYST_PATH
    text = myst_path.read_text()
    paths: list[str] = []
    in_toc = False
    for line in text.splitlines():
        if re.match(r"^\s*toc:\s*$", line):
            in_toc = True
            continue
        if in_toc and re.match(r"^\S", line):
            break
        if not in_toc:
            continue
        m = re.match(r"^\s*-\s*file:\s*(\S+)\s*$", line)
        if m:
            path = m.group(1)
            if path.endswith(".ipynb") and not path.startswith("week00/"):
                paths.append(path)
    return paths


def load_terms(path: Path | None = None) -> dict[str, Any]:
    path = path if path is not None else TERMS_PATH
    with path.open("rb") as f:
        return tomllib.load(f)


def get_units(data: dict[str, Any]) -> list[dict[str, Any]]:
    return data.get("unit", [])


def get_terms(data: dict[str, Any]) -> list[dict[str, Any]]:
    return data.get("term", [])


def load_notebook(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text())


def notebook_title(nb: dict[str, Any]) -> str | None:
    """First `# ` heading in document order across markdown cells."""
    for cell in nb.get("cells", []):
        if cell.get("cell_type") != "markdown":
            continue
        text = "".join(cell.get("source", []))
        for line in text.splitlines():
            m = re.match(r"^#\s+(.+?)\s*$", line)
            if m:
                return m.group(1)
    return None


# ----------------------------------------------------------------------------
# Cell eligibility
# ----------------------------------------------------------------------------


def is_skippable_markdown_cell(cell: dict[str, Any]) -> bool:
    """remove-cell tags, figure cells (label/diagram_source), and anchor-only cells."""
    meta = cell.get("metadata", {})
    if "remove-cell" in meta.get("tags", []):
        return True
    if meta.get("label") or meta.get("diagram_source"):
        return True
    text = "".join(cell.get("source", [])).strip()
    return bool(ANCHOR_CELL_RE.match(text))


# ----------------------------------------------------------------------------
# Exclusion ranges: never match/flag inside these regions of a markdown cell
# ----------------------------------------------------------------------------


def _fence_ranges(text: str) -> list[tuple[int, int]]:
    """Fenced code blocks (```) and directive fences (:::).

    Plain ``` fences (no `{...}` info string) are code: the whole block is excluded.
    Directive fences (``` {...} or :::[:]*{...}/:::) only have their marker *lines*
    excluded; their interior prose remains eligible for linking.
    """
    lines = text.splitlines(keepends=True)
    offsets: list[int] = []
    pos = 0
    for line in lines:
        offsets.append(pos)
        pos += len(line)

    ranges: list[tuple[int, int]] = []
    stack: list[tuple[str, bool, int, int]] = []  # marker, has_brace, start_idx, start_char
    for idx, raw in enumerate(lines):
        stripped = raw.strip()
        if stripped.startswith("```"):
            if stack and stack[-1][0] == "```":
                _marker, has_brace, start_idx, start_char = stack.pop()
                end_char = offsets[idx] + len(raw)
                if has_brace:
                    ranges.append((start_char, start_char + len(lines[start_idx])))
                    ranges.append((offsets[idx], end_char))
                else:
                    ranges.append((start_char, end_char))
            else:
                stack.append(("```", "{" in stripped, idx, offsets[idx]))
        elif stripped.startswith(":::"):
            if stack and stack[-1][0] == ":::":
                _marker, _has_brace, start_idx, start_char = stack.pop()
                end_char = offsets[idx] + len(raw)
                ranges.append((start_char, start_char + len(lines[start_idx])))
                ranges.append((offsets[idx], end_char))
            else:
                stack.append((":::", "{" in stripped, idx, offsets[idx]))
    return ranges


def _merge_ranges(ranges: list[tuple[int, int]]) -> list[tuple[int, int]]:
    if not ranges:
        return []
    ranges = sorted(ranges)
    merged = [ranges[0]]
    for s, e in ranges[1:]:
        ls, le = merged[-1]
        if s <= le:
            merged[-1] = (ls, max(le, e))
        else:
            merged.append((s, e))
    return merged


def _overlaps(start: int, end: int, ranges: list[tuple[int, int]]) -> bool:
    for s, e in ranges:
        if start < e and end > s:
            return True
    return False


def excluded_ranges(text: str, *, exclude_roles: bool = True) -> list[tuple[int, int]]:
    ranges = _fence_ranges(text)
    for pat in (HEADING_RE, INLINE_CODE_RE, MATH_BLOCK_RE, MATH_INLINE_RE, LINK_RE, HTML_TAG_RE, URL_RE):
        for m in pat.finditer(text):
            ranges.append((m.start(), m.end()))
    if exclude_roles:
        for m in ROLE_RE.finditer(text):
            ranges.append((m.start(), m.end()))
    return _merge_ranges(ranges)


# ----------------------------------------------------------------------------
# {term} role parsing
# ----------------------------------------------------------------------------


def resolve_role_label(content: str) -> str:
    """Given the backtick content of a {term}`...` role, return the resolved label."""
    content = content.strip()
    if " <" in content and content.endswith(">"):
        idx = content.rindex(" <")
        return content[idx + 2 : -1].strip()
    return content


def find_existing_term_labels(nb: dict[str, Any]) -> set[str]:
    labels: set[str] = set()
    for cell in nb.get("cells", []):
        if cell.get("cell_type") != "markdown":
            continue
        text = "".join(cell.get("source", []))
        for m in TERM_ROLE_RE.finditer(text):
            labels.add(resolve_role_label(m.group(1)))
    return labels


# ----------------------------------------------------------------------------
# Scope resolution
# ----------------------------------------------------------------------------


def eligible_lectures_for_term(
    term: dict[str, Any], units_by_title: dict[str, dict[str, Any]], all_lectures: list[str]
) -> set[str]:
    scope = term.get("scope", "all")
    if scope == "all":
        return set(all_lectures)
    if scope == "unit":
        unit = units_by_title.get(term.get("unit"))
        return set(unit["lectures"]) if unit else set()
    if isinstance(scope, list):
        result: set[str] = set()
        for item in scope:
            if item.endswith(".ipynb"):
                result.add(item)
                continue
            unit = units_by_title.get(item)
            if unit:
                result.update(unit["lectures"])
        return result
    return set()


# ----------------------------------------------------------------------------
# Linking
# ----------------------------------------------------------------------------


def _snippet(text: str, start: int, end: int, radius: int = 30) -> str:
    s = max(0, start - radius)
    e = min(len(text), end + radius)
    return text[s:e].replace("\n", " ").strip()


def _link_cell_text(
    text: str, all_candidates: list[tuple[str, str]], remaining: set[str]
) -> tuple[str, dict[str, tuple[int, int, str]]]:
    """Insert {term} roles for the first eligible occurrence of each label in `remaining`.

    `all_candidates` is every form of every term in the whole glossary, regardless of
    scope or whether it is still eligible. At each position we must find the *longest*
    matching form across the entire glossary first; if that winning term is not currently
    in `remaining` (out of scope for this lecture, or already linked earlier in the
    document), the whole span is blocked and we must not fall through to a shorter,
    overlapping form nested inside it (e.g. "Nash equilibrium" inside an out-of-scope
    "mixed strategy Nash equilibrium", or "prompt" inside an already-linked "prompt
    injection"). `remaining` is mutated in place as labels get linked.

    Returns the (possibly unchanged) text and a map of label -> (start, end, matched_text)
    for every label that was linked in this cell.
    """
    ranges = excluded_ranges(text, exclude_roles=True)
    sorted_candidates = sorted(all_candidates, key=lambda c: -len(c[0]))
    n = len(text)
    i = 0
    found: dict[str, tuple[int, int, str]] = {}
    edits: list[tuple[int, int, str]] = []
    while i < n and remaining:
        if _overlaps(i, i + 1, ranges):
            i += 1
            continue
        # Longest form wins; among equal-length matches (e.g. "environment" for both
        # the Julia and the ABM term), prefer a term that is still eligible here.
        matched = None
        for form, label in sorted_candidates:
            length = len(form)
            if matched and length < matched[3] - matched[2]:
                break
            if i + length > n:
                continue
            if text[i : i + length].lower() != form.lower():
                continue
            before_ok = i == 0 or not (text[i - 1].isalnum() or text[i - 1] == "_")
            after_ok = (i + length) >= n or not (
                text[i + length].isalnum() or text[i + length] == "_"
            )
            if not (before_ok and after_ok):
                continue
            if _overlaps(i, i + length, ranges):
                continue
            if matched is None or (label in remaining and matched[1] not in remaining):
                matched = (form, label, i, i + length)
        if matched:
            form, label, start, end = matched
            if label in remaining:
                matched_text = text[start:end]
                if matched_text == label:
                    repl = f"{{term}}`{label}`"
                else:
                    repl = f"{{term}}`{matched_text} <{label}>`"
                edits.append((start, end, repl))
                found[label] = (start, end, matched_text)
                remaining.discard(label)
            # else: the longest match at this position belongs to an ineligible term
            # (out of scope or already linked); block the whole span, don't link it,
            # and don't fall through to a shorter nested form.
            i = end
        else:
            i += 1
    if not edits:
        return text, found
    edits.sort(key=lambda e: e[0])
    out = []
    pos = 0
    for start, end, repl in edits:
        out.append(text[pos:start])
        out.append(repl)
        pos = end
    out.append(text[pos:])
    return "".join(out), found


def link_lecture(
    path: Path,
    rel: str,
    terms: list[dict[str, Any]],
    units_by_title: dict[str, dict[str, Any]],
    all_lectures: list[str],
) -> tuple[dict[str, Any], bool, list[dict[str, Any]]]:
    """Link eligible terms into one lecture notebook. Does not write the file."""
    nb = load_notebook(path)
    existing_labels = {label.lower() for label in find_existing_term_labels(nb)}

    all_candidates: list[tuple[str, str]] = []
    remaining: set[str] = set()
    for term in terms:
        label = term["label"]
        for form in term.get("forms", []):
            all_candidates.append((form, label))
        if label.lower() in existing_labels:
            continue
        elig = eligible_lectures_for_term(term, units_by_title, all_lectures)
        if rel in elig:
            remaining.add(label)

    insertions: list[dict[str, Any]] = []
    changed = False
    for idx, cell in enumerate(nb.get("cells", [])):
        if not remaining:
            break
        if cell.get("cell_type") != "markdown":
            continue
        if is_skippable_markdown_cell(cell):
            continue
        text = "".join(cell.get("source", []))
        new_text, found = _link_cell_text(text, all_candidates, remaining)
        for label, (start, end, matched_text) in found.items():
            insertions.append(
                {
                    "lecture": rel,
                    "label": label,
                    "matched": matched_text,
                    "cell": idx,
                    "context": _snippet(text, start, end),
                }
            )
        if new_text != text:
            cell["source"] = _same_shape(cell["source"], new_text)
            changed = True
    return nb, changed, insertions


def _restore_display(content: str) -> str:
    content = content.strip()
    if " <" in content and content.endswith(">"):
        idx = content.rindex(" <")
        return content[:idx]
    return content


def unlink_notebook(nb: dict[str, Any]) -> bool:
    changed = False
    for cell in nb.get("cells", []):
        if cell.get("cell_type") != "markdown":
            continue
        text = "".join(cell.get("source", []))
        new_text = TERM_ROLE_RE.sub(lambda m: _restore_display(m.group(1)), text)
        if new_text != text:
            cell["source"] = _same_shape(cell["source"], new_text)
            changed = True
    return changed


def _same_shape(original: str | list[str], new_text: str) -> str | list[str]:
    """nbformat allows source as one string or a list of lines; keep whichever the file used."""
    return new_text if isinstance(original, str) else new_text.splitlines(keepends=True)


def _json_style(raw: str) -> dict[str, Any]:
    """Infer how a notebook was serialized so rewrites only change the edited cells."""
    lines = raw.split("\n", 2)
    second = lines[1] if len(lines) > 1 else ""
    indent = len(second) - len(second.lstrip(" ")) or 1
    ascii_only = raw.isascii() and "\\u" in raw
    return {"indent": indent, "ensure_ascii": ascii_only, "newline": raw.endswith("\n")}


def write_notebook(path: Path, nb: dict[str, Any]) -> None:
    style = _json_style(path.read_text()) if path.exists() else {"indent": 1, "ensure_ascii": False, "newline": True}
    text = json.dumps(nb, indent=style["indent"], ensure_ascii=style["ensure_ascii"])
    path.write_text(text + ("\n" if style["newline"] else ""))


# ----------------------------------------------------------------------------
# Render
# ----------------------------------------------------------------------------

GLOSSARY_INTRO = (
    "Key terms from CAP-6318, organized by unit. Each term links to the lecture that "
    "introduces it."
)


def render_glossary_text(data: dict[str, Any], root: Path | None = None) -> str:
    root = root if root is not None else ROOT
    units = get_units(data)
    terms = get_terms(data)
    by_unit: dict[str, list[dict[str, Any]]] = {}
    for t in terms:
        by_unit.setdefault(t["unit"], []).append(t)

    title_cache: dict[str, str] = {}

    def title_for(rel: str) -> str:
        if rel not in title_cache:
            nb = load_notebook(root / rel)
            title = notebook_title(nb)
            if title is None:
                raise ValueError(f"{rel}: no top-level '# ' heading found for glossary link title")
            title_cache[rel] = title
        return title_cache[rel]

    lines = ["# Glossary", "", GLOSSARY_INTRO, ""]
    for unit in units:
        unit_terms = sorted(by_unit.get(unit["title"], []), key=lambda t: t["label"].lower())
        if not unit_terms:
            continue
        lines.append(f"## {unit['title']}")
        lines.append("")
        lines.append(":::{glossary}")
        entries = []
        for t in unit_terms:
            lecture_title = title_for(t["defined_in"])
            entries.append(
                f"{t['label']}\n: {t['definition'].strip()} *Introduced in* "
                f"[{lecture_title}]({t['defined_in']})."
            )
        lines.append("\n\n".join(entries))
        lines.append(":::")
        lines.append("")
    return "\n".join(lines).rstrip("\n") + "\n"


def cmd_render(args: argparse.Namespace) -> int:
    data = load_terms()
    text = render_glossary_text(data)
    if args.check:
        if not GLOSSARY_PATH.exists() or GLOSSARY_PATH.read_text() != text:
            print("glossary.md is stale; run `uv run python scripts/glossary.py render`.")
            return 1
        print("glossary.md is up to date.")
        return 0
    GLOSSARY_PATH.write_text(text)
    print(f"Wrote {GLOSSARY_PATH.relative_to(ROOT)}.")
    return 0


# ----------------------------------------------------------------------------
# Check
# ----------------------------------------------------------------------------


class Issue:
    def __init__(self, file: str, message: str, cell: int | None = None):
        self.file = file
        self.cell = cell
        self.message = message

    def __str__(self) -> str:
        loc = f"{self.file}" + (f" (cell {self.cell})" if self.cell is not None else "")
        return f"{loc}: {self.message}"


def _nearest_label(label: str, known_labels: list[str]) -> str | None:
    exact_ci = [k for k in known_labels if k.lower() == label.lower()]
    if exact_ci:
        return exact_ci[0]
    matches = difflib.get_close_matches(label, known_labels, n=1, cutoff=0.6)
    return matches[0] if matches else None


def _check_toml(
    data: dict[str, Any], all_lectures: list[str], root: Path
) -> tuple[list[Issue], list[Issue], dict[str, dict[str, Any]], list[dict[str, Any]]]:
    errors: list[Issue] = []
    warnings: list[Issue] = []
    rel = str(TERMS_PATH.relative_to(root)) if TERMS_PATH.is_relative_to(root) else str(TERMS_PATH)

    units = get_units(data)
    terms = get_terms(data)
    units_by_title = {u["title"]: u for u in units}

    seen_labels_ci: dict[str, str] = {}
    all_labels = [t["label"] for t in terms]
    for t in terms:
        label = t["label"]
        key = label.lower()
        if key in seen_labels_ci and seen_labels_ci[key] != label:
            errors.append(Issue(rel, f"duplicate label (case-insensitive): '{label}' vs '{seen_labels_ci[key]}'"))
        elif key in seen_labels_ci:
            errors.append(Issue(rel, f"duplicate label: '{label}' appears more than once"))
        seen_labels_ci[key] = label

        unit_title = t.get("unit")
        if unit_title not in units_by_title:
            errors.append(Issue(rel, f"term '{label}': unit '{unit_title}' is not defined"))

        defined_in = t.get("defined_in")
        if defined_in not in all_lectures:
            errors.append(Issue(rel, f"term '{label}': defined_in '{defined_in}' is not listed in myst.yml"))
        elif unit_title in units_by_title and defined_in not in units_by_title[unit_title].get("lectures", []):
            errors.append(
                Issue(rel, f"term '{label}': defined_in '{defined_in}' is not in unit '{unit_title}'")
            )

        forms = t.get("forms") or []
        if not forms:
            errors.append(Issue(rel, f"term '{label}': forms must be non-empty"))

        scope = t.get("scope", "all")
        if isinstance(scope, list):
            for item in scope:
                if item.endswith(".ipynb"):
                    if item not in all_lectures:
                        errors.append(
                            Issue(
                                rel,
                                f"term '{label}': scope references lecture '{item}' not in myst.yml",
                            )
                        )
                elif item not in units_by_title:
                    errors.append(Issue(rel, f"term '{label}': scope references unknown unit '{item}'"))
        elif scope not in VALID_SCOPE_LITERALS:
            errors.append(Issue(rel, f"term '{label}': invalid scope {scope!r}"))

        definition = (t.get("definition") or "").strip()
        if not definition:
            errors.append(Issue(rel, f"term '{label}': empty definition"))
        else:
            for m in TERM_ROLE_RE.finditer(definition):
                ref_label = resolve_role_label(m.group(1))
                if ref_label.lower() not in seen_labels_ci and ref_label not in all_labels:
                    # Defer: may be defined later in the file; resolved below after full scan.
                    pass

        # defined_in lecture must actually contain one of the forms in prose.
        if defined_in in all_lectures and forms:
            try:
                nb = load_notebook(root / defined_in)
            except (FileNotFoundError, json.JSONDecodeError):
                nb = None
            if nb is not None:
                found_form = False
                for cell in nb.get("cells", []):
                    if cell.get("cell_type") != "markdown" or is_skippable_markdown_cell(cell):
                        continue
                    text = "".join(cell.get("source", []))
                    for form in forms:
                        if re.search(
                            r"(?<![\w])" + re.escape(form) + r"(?![\w])", text, re.IGNORECASE
                        ):
                            found_form = True
                            break
                    if found_form:
                        break
                if not found_form:
                    errors.append(
                        Issue(
                            rel,
                            f"term '{label}': defined_in '{defined_in}' never mentions any of its "
                            f"forms {forms} in a markdown cell (wrong lecture or wrong forms?)",
                        )
                    )

    # Definition {term} references must resolve against the final label set.
    label_set = {t["label"] for t in terms}
    for t in terms:
        definition = (t.get("definition") or "").strip()
        for m in TERM_ROLE_RE.finditer(definition):
            ref_label = resolve_role_label(m.group(1))
            if ref_label not in label_set:
                suggestion = _nearest_label(ref_label, all_labels)
                hint = f" (did you mean '{suggestion}'?)" if suggestion else ""
                errors.append(
                    Issue(
                        rel,
                        f"term '{t['label']}': definition references unknown term "
                        f"'{ref_label}'{hint}",
                    )
                )

    # Duplicate forms with overlapping scope: ambiguous linking.
    form_owners: dict[str, list[tuple[str, set[str]]]] = {}
    for t in terms:
        elig = eligible_lectures_for_term(t, units_by_title, all_lectures)
        for form in t.get("forms", []):
            form_owners.setdefault(form.lower(), []).append((t["label"], elig))
    for form, owners in form_owners.items():
        for i in range(len(owners)):
            for j in range(i + 1, len(owners)):
                label_a, elig_a = owners[i]
                label_b, elig_b = owners[j]
                if label_a == label_b:
                    continue
                overlap = elig_a & elig_b
                if overlap:
                    sample = min(overlap)
                    errors.append(
                        Issue(
                            rel,
                            f"form '{form}' is claimed by both '{label_a}' and '{label_b}' "
                            f"with overlapping scope (e.g. {sample}); ambiguous linking",
                        )
                    )

    return errors, warnings, units_by_title, terms


def _classify_role_context(
    start: int, end: int, text: str, cell_ranges: list[tuple[int, int]]
) -> str | None:
    """Return a human description if the role sits inside a forbidden region, else None.

    Note: a {term}`label` role's own backticks look like inline code to a naive scan, so
    only a code span that *starts before* the role counts as real nesting inside someone
    else's inline code; the role's own delimiters don't count.
    """
    for m in HEADING_RE.finditer(text):
        if start < m.end() and end > m.start():
            return "a heading line"
    for m in INLINE_CODE_RE.finditer(text):
        if m.start() < start and m.end() > start:
            return "inline code"
    for m in MATH_BLOCK_RE.finditer(text):
        if start < m.end() and end > m.start():
            return "a math block"
    for m in MATH_INLINE_RE.finditer(text):
        if start < m.end() and end > m.start():
            return "inline math"
    for fs, fe in cell_ranges:
        if start < fe and end > fs:
            return "a fenced code block"
    return None


def _check_notebook_roles(
    path: Path, rel: str, label_set: set[str], all_labels: list[str]
) -> tuple[list[Issue], list[Issue], dict[str, int]]:
    """Validate every {term} role (and lookalikes) in one lecture notebook.

    Returns (errors, warnings, label_counts) where label_counts tracks how many times
    each resolved label was linked in this notebook (for over-linking detection).
    """
    errors: list[Issue] = []
    warnings: list[Issue] = []
    label_counts: dict[str, int] = {}
    nb = load_notebook(path)
    for idx, cell in enumerate(nb.get("cells", [])):
        text = "".join(cell.get("source", []))
        cell_type = cell.get("cell_type")
        is_hidden = cell_type == "markdown" and "remove-cell" in cell.get("metadata", {}).get(
            "tags", []
        )

        for m in ROLE_START_RE.finditer(text):
            role_name, backticks = m.group(1), m.group(2)
            lname = role_name.lower()
            is_term_role = lname == "term"
            is_lookalike = bool(TERM_LOOKALIKE_RE.match(role_name)) or (
                lname == "glossary" and backticks
            )
            if not is_term_role and not is_lookalike:
                continue

            if cell_type == "code":
                errors.append(
                    Issue(rel, f"'{{{role_name}}}' role found inside a code cell", idx)
                )
                continue
            if is_hidden:
                errors.append(
                    Issue(
                        rel,
                        f"'{{{role_name}}}' role found inside a hidden (remove-cell) cell",
                        idx,
                    )
                )
                continue

            if is_lookalike:
                errors.append(
                    Issue(
                        rel,
                        f"'{{{role_name}}}' is not a valid term role (did you mean '{{term}}'?)",
                        idx,
                    )
                )
                continue

            # is_term_role: validate backtick structure.
            if not backticks:
                errors.append(Issue(rel, "'{term}' role is missing its opening backtick", idx))
                continue
            full_match = TERM_ROLE_RE.match(text, m.start())
            if full_match is None or full_match.start() != m.start():
                errors.append(
                    Issue(
                        rel,
                        f"'{{term}}' role near position {m.start()} has unbalanced backticks",
                        idx,
                    )
                )
                continue
            content = full_match.group(1)
            if not content.strip():
                errors.append(Issue(rel, "'{term}' role has an empty label", idx))
                continue
            if content.strip().startswith("<"):
                errors.append(
                    Issue(
                        rel,
                        f"'{{term}}`{content}`' has '<...>' with no display text before it",
                        idx,
                    )
                )
                continue
            if "<" in content and not content.rstrip().endswith(">"):
                errors.append(
                    Issue(rel, f"'{{term}}`{content}`' has a malformed '<label>' suffix", idx)
                )
                continue

            label = resolve_role_label(content)
            if label not in label_set:
                suggestion = _nearest_label(label, all_labels)
                hint = f" (did you mean '{suggestion}'?)" if suggestion else ""
                errors.append(
                    Issue(rel, f"'{{term}}' references unknown label '{label}'{hint}", idx)
                )
                continue

            cell_ranges = _fence_ranges(text)
            context = _classify_role_context(full_match.start(), full_match.end(), text, cell_ranges)
            if context is not None:
                errors.append(
                    Issue(rel, f"'{{term}}`{label}`' link is inside {context} and won't render", idx)
                )
                continue

            label_counts[label] = label_counts.get(label, 0) + 1

    for label, count in label_counts.items():
        if count > 1:
            errors.append(
                Issue(rel, f"term '{label}' is linked {count} times; only the first use should link")
            )

    return errors, warnings, label_counts


def run_check(root: Path | None = None) -> tuple[list[Issue], list[Issue]]:
    errors: list[Issue] = []
    warnings: list[Issue] = []
    root = root if root is not None else ROOT

    all_lectures = load_toc_notebooks(root / "myst.yml")
    data = load_terms(root / "glossary" / "terms.toml")
    toml_errors, toml_warnings, units_by_title, terms = _check_toml(data, all_lectures, root)
    errors.extend(toml_errors)
    warnings.extend(toml_warnings)

    label_set = {t["label"] for t in terms}
    all_labels = [t["label"] for t in terms]

    # glossary.md staleness.
    glossary_rel = "glossary.md"
    try:
        rendered = render_glossary_text(data, root)
        if not (root / "glossary.md").exists() or (root / "glossary.md").read_text() != rendered:
            errors.append(Issue(glossary_rel, "stale relative to glossary/terms.toml; run `render`"))
        else:
            for m in TERM_ROLE_RE.finditer(rendered):
                ref_label = resolve_role_label(m.group(1))
                if ref_label not in label_set:
                    suggestion = _nearest_label(ref_label, all_labels)
                    hint = f" (did you mean '{suggestion}'?)" if suggestion else ""
                    errors.append(
                        Issue(glossary_rel, f"'{{term}}' references unknown label '{ref_label}'{hint}")
                    )
    except (FileNotFoundError, json.JSONDecodeError, ValueError) as exc:
        errors.append(Issue(glossary_rel, f"could not render for validation: {exc}"))

    linked_labels_overall: set[str] = set()
    lectures_with_links: set[str] = set()
    unlinked_form_hits = 0

    for rel in all_lectures:
        path = root / rel
        if not path.exists():
            errors.append(Issue(rel, "listed in myst.yml but file does not exist"))
            continue
        nb_errors, nb_warnings, label_counts = _check_notebook_roles(path, rel, label_set, all_labels)
        errors.extend(nb_errors)
        warnings.extend(nb_warnings)
        if label_counts:
            lectures_with_links.add(rel)
        linked_labels_overall.update(label_counts)

        # WARN: links `link --apply` would still add (prose added since the last run).
        # Reuse the linker itself so this agrees exactly with longest-match/scope rules.
        _, _, pending = link_lecture(path, rel, terms, units_by_title, all_lectures)
        if pending:
            unlinked_form_hits += 1

    # WARN: terms never linked anywhere.
    for t in terms:
        if t["label"] not in linked_labels_overall:
            warnings.append(Issue("glossary/terms.toml", f"term '{t['label']}' is never linked in any lecture"))

    # WARN: lectures with zero glossary links.
    for rel in all_lectures:
        if rel not in lectures_with_links:
            warnings.append(Issue(rel, "lecture has zero glossary links"))

    if unlinked_form_hits:
        warnings.append(
            Issue(
                "glossary",
                f"{unlinked_form_hits} lecture(s) contain in-scope glossary terms with unlinked "
                "prose occurrences; run `make glossary-links`",
            )
        )

    return errors, warnings


def cmd_check(args: argparse.Namespace) -> int:
    errors, warnings = run_check()
    for w in warnings:
        print(f"WARN: {w}")
    for e in errors:
        print(f"ERROR: {e}")
    print(f"\n{len(errors)} error(s), {len(warnings)} warning(s).")
    return 1 if errors else 0


# ----------------------------------------------------------------------------
# Link / Unlink
# ----------------------------------------------------------------------------


def cmd_link(args: argparse.Namespace) -> int:
    data = load_terms()
    units = get_units(data)
    terms = get_terms(data)
    units_by_title = {u["title"]: u for u in units}
    all_lectures = load_toc_notebooks()

    if args.lecture:
        lectures = [args.lecture]
    else:
        lectures = all_lectures

    total_insertions = 0
    for rel in lectures:
        path = ROOT / rel
        if not path.exists():
            print(f"{rel}: not found, skipping")
            continue
        nb, changed, insertions = link_lecture(path, rel, terms, units_by_title, all_lectures)
        if insertions:
            print(f"{rel}:")
            for ins in insertions:
                print(
                    f"  + {ins['label']!r} <- '{ins['matched']}' (cell {ins['cell']}): "
                    f"...{ins['context']}..."
                )
            total_insertions += len(insertions)
        if args.apply and changed:
            write_notebook(path, nb)

    if args.apply:
        print(f"\nApplied {total_insertions} insertion(s).")
    else:
        print(f"\n{total_insertions} insertion(s) would be made (dry run; pass --apply to write).")
    return 0


def cmd_unlink(args: argparse.Namespace) -> int:
    all_lectures = load_toc_notebooks()
    total = 0
    for rel in all_lectures:
        path = ROOT / rel
        if not path.exists():
            continue
        nb = load_notebook(path)
        changed = unlink_notebook(nb)
        if changed:
            total += 1
            print(f"{rel}: would unlink" if not args.apply else f"{rel}: unlinked")
            if args.apply:
                write_notebook(path, nb)
    print(f"\n{total} notebook(s) {'unlinked' if args.apply else 'would be unlinked'}.")
    return 0


# ----------------------------------------------------------------------------
# CLI
# ----------------------------------------------------------------------------


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    p_render = sub.add_parser("render", help="Render glossary.md from glossary/terms.toml")
    p_render.add_argument("--check", action="store_true", help="Fail if glossary.md is stale")
    p_render.set_defaults(func=cmd_render)

    p_check = sub.add_parser("check", help="Validate terms.toml, glossary.md, and term links")
    p_check.set_defaults(func=cmd_check)

    p_link = sub.add_parser("link", help="Insert {term} links into lecture notebooks")
    p_link.add_argument("--apply", action="store_true", help="Write changes (default: dry run)")
    p_link.add_argument("--lecture", help="Only process this lecture path")
    p_link.set_defaults(func=cmd_link)

    p_unlink = sub.add_parser("unlink", help="Remove every {term} role from lecture notebooks")
    p_unlink.add_argument("--apply", action="store_true", help="Write changes (default: dry run)")
    p_unlink.set_defaults(func=cmd_unlink)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
