#!/usr/bin/env python3
"""Build student oral-exam notebooks from an instructor question bank."""

from __future__ import annotations

import argparse
import copy
import json
import random
import re
from pathlib import Path

ANSWER_RE = re.compile(
    r"(?is)(?:^|\n)(?:#{1,6}\s*)?(?:\*\*)?Expected Answer(?:\*\*)?:?.*"
)
KEY_RE = re.compile(
    r"(?is)(?:^|\n)(?:#{1,6}\s*)?(?:\*\*)?Key concepts to listen for(?:\*\*)?:?.*"
)

PREAMBLE = """\
# {title} - Student Version {n}

## Fall {year}

**Instructions:**
- You have 20 minutes to complete this exam
- Camera must be on and screen must be shared
- Answer each question to the best of your ability
- You may run code in Julia if needed
"""


def cell_text(cell: dict) -> str:
    src = cell.get("source", "")
    return "".join(src) if isinstance(src, list) else src


def content_lines(text: str) -> list[str]:
    lines = text.splitlines()
    while lines and (not lines[0].strip() or lines[0].strip() == "---"):
        lines.pop(0)
    return lines


def first_line(text: str) -> str:
    lines = content_lines(text)
    return lines[0].strip() if lines else ""


def md_cell(text: str) -> dict:
    return {"cell_type": "markdown", "metadata": {}, "source": [text]}


def parse_questions(cells: list[dict]) -> list[dict]:
    questions: list[dict] = []
    current = None
    variation = None
    for cell in cells:
        line = first_line(cell_text(cell))
        if line.startswith("## Question"):
            current = {"header": line, "variations": []}
            questions.append(current)
            variation = None
            continue
        if line.startswith("## "):
            current = None
            variation = None
            continue
        if current is None:
            continue
        if line.startswith("### Variation"):
            variation = [cell]
            current["variations"].append(variation)
            continue
        if line.startswith("### "):
            variation = None
            continue
        if variation is not None:
            variation.append(cell)
    return questions


def exam_meta(cells: list[dict]) -> tuple[str, str]:
    text = cell_text(cells[0]) if cells else ""
    title_m = re.search(r"#\s*(Oral Exam\s+\d+)", text)
    year_m = re.search(r"Fall\s+(\d{4})", text)
    return (
        title_m.group(1) if title_m else "Oral Exam",
        year_m.group(1) if year_m else "2026",
    )


def studentize_cell(cell: dict) -> dict | None:
    cell = copy.deepcopy(cell)
    if cell.get("cell_type") == "code":
        cell["outputs"] = []
        cell["execution_count"] = None
        return cell
    text = ANSWER_RE.sub("", cell_text(cell))
    text = KEY_RE.sub("", text).strip()
    if not text:
        return None
    lines = content_lines(text)
    if lines and (
        lines[0].startswith("### Variation") or lines[0].startswith("**Variation")
    ):
        lines = content_lines("\n".join(lines[1:]))
        text = "\n".join(lines).strip()
        if not text:
            return None
    else:
        text = "\n".join(lines).strip()
        if not text:
            return None
    cell["source"] = [text]
    return cell


def student_notebook(
    instructor: dict,
    questions: list[dict],
    picks: list[list[dict]],
    n: int,
    title: str,
    year: str,
) -> dict:
    cells = [md_cell(PREAMBLE.format(title=title, n=n, year=year))]
    for question, variation in zip(questions, picks, strict=True):
        cells.append(md_cell(question["header"]))
        for cell in variation:
            cleaned = studentize_cell(cell)
            if cleaned is not None:
                cells.append(cleaned)
    return {
        "cells": cells,
        "metadata": instructor.get("metadata", {}),
        "nbformat": instructor.get("nbformat", 4),
        "nbformat_minor": instructor.get("nbformat_minor", 5),
    }


def generate(
    instructor_path: str | Path,
    outdir: str | Path,
    n_students: int,
    seed: int = 0,
) -> list[Path]:
    instructor = json.loads(Path(instructor_path).read_text())
    questions = parse_questions(instructor["cells"])
    if not questions or any(not q["variations"] for q in questions):
        raise ValueError("instructor notebook has no questions with variations")
    title, year = exam_meta(instructor["cells"])
    rng = random.Random(seed)
    dest = Path(outdir)
    dest.mkdir(parents=True, exist_ok=True)
    paths = []
    for n in range(1, n_students + 1):
        picks = [rng.choice(q["variations"]) for q in questions]
        notebook = student_notebook(instructor, questions, picks, n, title, year)
        path = dest / f"student-exam-{n}.ipynb"
        path.write_text(json.dumps(notebook, indent=1) + "\n")
        paths.append(path)
    return paths


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("instructor", type=Path)
    p.add_argument("-n", "--n-students", type=int, required=True)
    p.add_argument("-o", "--outdir", type=Path, default=Path("."))
    p.add_argument("--seed", type=int, default=0)
    args = p.parse_args()
    for path in generate(args.instructor, args.outdir, args.n_students, args.seed):
        print(path)


if __name__ == "__main__":
    main()
