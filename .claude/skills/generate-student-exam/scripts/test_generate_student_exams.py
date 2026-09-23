"""Behavior tests for student oral-exam generation. Run: python test_generate_student_exams.py"""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import generate_student_exams as g


def md(text: str) -> dict:
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": [text],
    }


def code(text: str) -> dict:
    return {
        "cell_type": "code",
        "metadata": {},
        "execution_count": None,
        "outputs": [{"output_type": "stream", "text": "secret"}],
        "source": [text],
    }


def nb(cells: list[dict]) -> dict:
    return {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Julia 1.11.6",
                "language": "julia",
                "name": "julia-1.11",
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4,
    }


INSTRUCTOR = nb(
    [
        md(
            "# Oral Exam 2 - Instructor Version\n\n"
            "> Fall 2026, Spencer Lyon\n"
        ),
        md(
            "## Question 1: Mixed Strategies\n\n"
            "**Format**: Show a game.\n"
        ),
        md(
            "### Variation 1.1: Matching Pennies\n\n"
            "Find the mixed NE.\n\n"
            "#### Expected Answer\n\n"
            "p = 1/2. Students must not see this."
        ),
        md("### Variation 1.2: Hawk-Dove\n\nFind all NE."),
        md("**Expected Answer**\n\nHawk-Dove answer leak."),
        md("## Question 2: Code\n\n**Format**: Complete the function."),
        md("### Variation 2.1: Best Response\n\nComplete `find_best_response`."),
        code("function find_best_response()\n    # TODO\nend"),
        md("**Expected Answer**\n\n```julia\nargmax(payoffs)\n```"),
        md(
            "### Variation 2.2: Weak Dominance\n\nComplete `is_weakly_dominated`.\n\n"
            "**Key concepts to listen for**:\n- leak"
        ),
        code("function is_weakly_dominated()\n    # TODO\nend"),
        md("## Grading Rubric\n\nsecret rubric leak"),
        md("## Exam Administration Notes\n\nDo not give this to students."),
    ]
)


class GenerateStudentExams(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.instructor = self.dir / "instructor.ipynb"
        self.instructor.write_text(json.dumps(INSTRUCTOR))
        self.out = self.dir / "out"

    def tearDown(self):
        self.tmp.cleanup()

    def generate(self, n=2, seed=0):
        return g.generate(self.instructor, self.out, n_students=n, seed=seed)

    def load(self, n: int) -> dict:
        return json.loads((self.out / f"student-exam-{n}.ipynb").read_text())

    def texts(self, n: int) -> str:
        blob = []
        for cell in self.load(n)["cells"]:
            src = cell["source"]
            blob.append("".join(src) if isinstance(src, list) else src)
        return "\n".join(blob)

    def test_writes_n_notebooks(self):
        paths = self.generate(n=3, seed=1)
        self.assertEqual([p.name for p in paths], [
            "student-exam-1.ipynb",
            "student-exam-2.ipynb",
            "student-exam-3.ipynb",
        ])

    def test_preamble_and_one_variation_per_question(self):
        self.generate(n=1, seed=0)
        cells = self.load(1)["cells"]
        joined = self.texts(1)
        self.assertIn("# Oral Exam 2 - Student Version 1", joined)
        self.assertIn("Fall 2026", joined)
        self.assertIn("20 minutes", joined)
        self.assertIn("## Question 1: Mixed Strategies", joined)
        self.assertIn("## Question 2: Code", joined)
        self.assertNotIn("**Format**", joined)
        self.assertNotIn("Variation", joined)
        self.assertTrue(("Find the mixed NE" in joined) ^ ("Find all NE" in joined))
        self.assertTrue(
            ("find_best_response" in joined) ^ ("is_weakly_dominated" in joined)
        )
        self.assertEqual(sum(c["cell_type"] == "code" for c in cells), 1)

    def test_strips_answers_admin_notes_and_code_outputs(self):
        self.generate(n=2, seed=0)
        for n in (1, 2):
            joined = self.texts(n)
            self.assertNotIn("Expected Answer", joined)
            self.assertNotIn("Students must not see this", joined)
            self.assertNotIn("Hawk-Dove answer leak", joined)
            self.assertNotIn("argmax(payoffs)", joined)
            self.assertNotIn("Key concepts to listen for", joined)
            self.assertNotIn("Exam Administration", joined)
            self.assertNotIn("Instructor Version", joined)
            self.assertNotIn("Grading Rubric", joined)
            self.assertNotIn("secret rubric leak", joined)
            self.assertNotIn("Variation", joined)
            for cell in self.load(n)["cells"]:
                if cell["cell_type"] == "code":
                    self.assertEqual(cell.get("outputs"), [])

    def test_seed_is_deterministic_and_covers_both_variants(self):
        self.generate(n=1, seed=0)
        first = self.texts(1)
        self.generate(n=1, seed=0)
        self.assertEqual(first, self.texts(1))
        texts = []
        for seed in range(30):
            self.generate(n=1, seed=seed)
            texts.append(self.texts(1))
        self.assertTrue(any("Find the mixed NE" in t for t in texts))
        self.assertTrue(any("Find all NE" in t for t in texts))

    def test_skips_hr_and_non_variation_h3(self):
        bank = nb(
            [
                md("# Oral Exam 2 - Instructor Version\n\n> Fall 2026\n"),
                md("---\n## Question 1: Mixed Strategies\n"),
                md("### Variation 1.1: A\n\nPrompt A"),
                md("### Solution\n\nsecret solution"),
                md("### Variation 1.2: B\n\nPrompt B"),
            ]
        )
        path = self.dir / "dash.ipynb"
        path.write_text(json.dumps(bank))
        g.generate(path, self.out, n_students=1, seed=0)
        joined = self.texts(1)
        self.assertIn("## Question 1: Mixed Strategies", joined)
        self.assertTrue(("Prompt A" in joined) ^ ("Prompt B" in joined))
        self.assertNotIn("Variation", joined)
        self.assertNotIn("secret solution", joined)
        self.assertNotIn("Solution", joined)


if __name__ == "__main__":
    unittest.main()
