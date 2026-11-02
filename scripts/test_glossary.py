import json
import tempfile
import unittest
from pathlib import Path

import glossary

# ----------------------------------------------------------------------------
# Fixture helpers
# ----------------------------------------------------------------------------


def _toml_str(s: str) -> str:
    return json.dumps(s)


def _toml_list(items: list[str]) -> str:
    return "[" + ", ".join(_toml_str(i) for i in items) + "]"


def build_terms_toml(units: list[dict], terms: list[dict]) -> str:
    lines: list[str] = []
    for u in units:
        lines.append("[[unit]]")
        lines.append(f"title = {_toml_str(u['title'])}")
        lines.append(f"lectures = {_toml_list(u['lectures'])}")
        lines.append("")
    for t in terms:
        lines.append("[[term]]")
        lines.append(f"label = {_toml_str(t['label'])}")
        lines.append(f"unit = {_toml_str(t['unit'])}")
        lines.append(f"defined_in = {_toml_str(t['defined_in'])}")
        lines.append(f"definition = {_toml_str(t['definition'])}")
        lines.append(f"forms = {_toml_list(t.get('forms', [t['label']]))}")
        scope = t.get("scope", "all")
        if isinstance(scope, list):
            lines.append(f"scope = {_toml_list(scope)}")
        else:
            lines.append(f"scope = {_toml_str(scope)}")
        lines.append("")
    return "\n".join(lines)


def build_myst_yml(lecture_paths: list[str]) -> str:
    lines = ["version: 1", "project:", "  toc:"]
    for p in lecture_paths:
        lines.append(f"    - file: {p}")
    lines.append("site:")
    lines.append("  template: book-theme")
    return "\n".join(lines) + "\n"


def md_cell(source_lines: list[str], metadata: dict | None = None, cell_id: str | None = None) -> dict:
    cell = {"cell_type": "markdown", "metadata": metadata or {}, "source": source_lines}
    if cell_id:
        cell["id"] = cell_id
    return cell


def code_cell(source_lines: list[str]) -> dict:
    return {
        "cell_type": "code",
        "metadata": {},
        "source": source_lines,
        "outputs": [],
        "execution_count": None,
    }


def make_notebook(cells: list[dict]) -> dict:
    return {"cells": cells, "metadata": {}, "nbformat": 4, "nbformat_minor": 5}


def write_notebook(path: Path, cells: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(make_notebook(cells)))


# ----------------------------------------------------------------------------
# Base test case: builds a repo-shaped temp dir and repoints glossary globals
# ----------------------------------------------------------------------------


class GlossaryTestCase(unittest.TestCase):
    def setUp(self):
        self._tmpdir = tempfile.TemporaryDirectory()
        self.addCleanup(self._tmpdir.cleanup)
        self.root = Path(self._tmpdir.name)
        (self.root / "glossary").mkdir()

        self._orig_root = glossary.ROOT
        self._orig_terms = glossary.TERMS_PATH
        self._orig_glossary = glossary.GLOSSARY_PATH
        self._orig_myst = glossary.MYST_PATH
        glossary.ROOT = self.root
        glossary.TERMS_PATH = self.root / "glossary" / "terms.toml"
        glossary.GLOSSARY_PATH = self.root / "glossary.md"
        glossary.MYST_PATH = self.root / "myst.yml"
        self.addCleanup(self._restore_globals)

    def _restore_globals(self):
        glossary.ROOT = self._orig_root
        glossary.TERMS_PATH = self._orig_terms
        glossary.GLOSSARY_PATH = self._orig_glossary
        glossary.MYST_PATH = self._orig_myst

    def write_myst(self, lectures: list[str]) -> None:
        glossary.MYST_PATH.write_text(build_myst_yml(lectures))

    def write_terms(self, units: list[dict], terms: list[dict]) -> None:
        glossary.TERMS_PATH.write_text(build_terms_toml(units, terms))

    def write_nb(self, rel: str, cells: list[dict]) -> None:
        write_notebook(self.root / rel, cells)


# ----------------------------------------------------------------------------
# A richly-featured standard fixture shared by several tests
# ----------------------------------------------------------------------------


def standard_fixture(tc: GlossaryTestCase) -> None:
    tc.write_myst(
        [
            "week00/L00.01_front.ipynb",  # excluded (week00)
            "week01/L01.01_intro.ipynb",
            "week01/L01.02_setup.ipynb",
            "week02/L02.01_types.ipynb",
        ]
    )
    tc.write_terms(
        units=[
            {
                "title": "Unit A",
                "lectures": ["week01/L01.01_intro.ipynb", "week01/L01.02_setup.ipynb"],
            },
            {"title": "Unit B", "lectures": ["week02/L02.01_types.ipynb"]},
        ],
        terms=[
            {
                "label": "multiple dispatch",
                "unit": "Unit A",
                "defined_in": "week01/L01.02_setup.ipynb",
                "definition": "Choosing which method of a function runs based on argument types.",
                "forms": ["multiple dispatch"],
                "scope": "all",
            },
            {
                "label": "method",
                "unit": "Unit A",
                "defined_in": "week01/L01.01_intro.ipynb",
                "definition": "A function implementation attached to specific types.",
                "forms": ["method", "methods"],
                "scope": "all",
            },
            {
                "label": "Nash equilibrium",
                "unit": "Unit B",
                "defined_in": "week02/L02.01_types.ipynb",
                "definition": "A strategy profile where no player benefits from deviating alone.",
                "forms": ["Nash equilibrium", "Nash equilibria"],
                "scope": "unit",
            },
        ],
    )
    tc.write_nb(
        "week00/L00.01_front.ipynb",
        [md_cell(["# Front matter\n", "\n", "A method mentioned here must never be touched."])],
    )
    tc.write_nb(
        "week01/L01.01_intro.ipynb",
        [
            md_cell(["# Intro\n", "\n", "A method is a function implementation."]),
            md_cell(["Methods compose well. A method is reused later too."]),
        ],
    )
    tc.write_nb(
        "week01/L01.02_setup.ipynb",
        [md_cell(["# Setup\n", "\n", "Multiple dispatch builds on methods."])],
    )
    tc.write_nb(
        "week02/L02.01_types.ipynb",
        [md_cell(["# Types\n", "\n", "A Nash equilibrium is a stable outcome."])],
    )


# ----------------------------------------------------------------------------
# render
# ----------------------------------------------------------------------------


class RenderTest(GlossaryTestCase):
    def test_render_orders_units_and_sorts_terms_alphabetically(self):
        standard_fixture(self)
        data = glossary.load_terms()
        text = glossary.render_glossary_text(data, root=self.root)
        unit_a_idx = text.index("## Unit A")
        unit_b_idx = text.index("## Unit B")
        self.assertLess(unit_a_idx, unit_b_idx)
        # "method" sorts before "multiple dispatch" case-insensitively.
        method_idx = text.index("method\n")
        dispatch_idx = text.index("multiple dispatch\n")
        self.assertLess(method_idx, dispatch_idx)

    def test_render_format_includes_definition_and_introduced_in_link(self):
        standard_fixture(self)
        data = glossary.load_terms()
        text = glossary.render_glossary_text(data, root=self.root)
        self.assertIn(
            "method\n"
            ": A function implementation attached to specific types. *Introduced in* "
            "[Intro](week01/L01.01_intro.ipynb).",
            text,
        )
        self.assertTrue(text.startswith("# Glossary\n\n"))
        self.assertIn(":::{glossary}", text)
        self.assertIn(":::\n", text)

    def test_render_check_detects_stale_glossary(self):
        standard_fixture(self)
        data = glossary.load_terms()
        glossary.GLOSSARY_PATH.write_text(glossary.render_glossary_text(data, root=self.root))
        errors, _ = glossary.run_check(self.root)
        stale = [e for e in errors if "stale" in e.message]
        self.assertEqual(stale, [])

        glossary.GLOSSARY_PATH.write_text("stale content")
        errors, _ = glossary.run_check(self.root)
        stale = [e for e in errors if "stale" in e.message]
        self.assertEqual(len(stale), 1)


# ----------------------------------------------------------------------------
# link: exclusion rules
# ----------------------------------------------------------------------------


class LinkExclusionTest(GlossaryTestCase):
    def _single_term_fixture(self, cell_source: list[str], metadata: dict | None = None):
        self.write_myst(["week01/L01.01_intro.ipynb"])
        self.write_terms(
            units=[{"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]}],
            terms=[
                {
                    "label": "method",
                    "unit": "Unit A",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "A function implementation.",
                    "forms": ["method"],
                    "scope": "all",
                }
            ],
        )
        cells = [md_cell(["# Intro"]), md_cell(cell_source, metadata=metadata)]
        self.write_nb("week01/L01.01_intro.ipynb", cells)

    def _linked_text_for_cell(self, index=1):
        data = glossary.load_terms()
        units_by_title = {u["title"]: u for u in glossary.get_units(data)}
        terms = glossary.get_terms(data)
        all_lectures = glossary.load_toc_notebooks()
        nb, changed, insertions = glossary.link_lecture(
            self.root / "week01/L01.01_intro.ipynb",
            "week01/L01.01_intro.ipynb",
            terms,
            units_by_title,
            all_lectures,
        )
        text = "".join(nb["cells"][index]["source"])
        return text, changed, insertions

    def test_does_not_link_inside_heading(self):
        self._single_term_fixture(["## A method heading\n", "\n", "Prose without the word."])
        text, changed, insertions = self._linked_text_for_cell()
        self.assertNotIn("{term}", text)
        self.assertFalse(changed)
        self.assertEqual(insertions, [])

    def test_does_not_link_inside_inline_code(self):
        self._single_term_fixture(["Use the `method` keyword in code."])
        text, _, insertions = self._linked_text_for_cell()
        self.assertNotIn("{term}", text)
        self.assertEqual(insertions, [])

    def test_does_not_link_inside_fenced_code_block(self):
        self._single_term_fixture(["```python\n", "# method call\n", "method()\n", "```"])
        text, _, insertions = self._linked_text_for_cell()
        self.assertNotIn("{term}", text)
        self.assertEqual(insertions, [])

    def test_does_not_link_inside_math(self):
        self._single_term_fixture(["Inline $method$ math and block:\n", "\n", "$$method$$"])
        text, _, insertions = self._linked_text_for_cell()
        self.assertNotIn("{term}", text)
        self.assertEqual(insertions, [])

    def test_does_not_link_existing_role(self):
        self._single_term_fixture(["See the {term}`method` role already here."])
        text, changed, insertions = self._linked_text_for_cell()
        self.assertEqual(text, "See the {term}`method` role already here.")
        self.assertFalse(changed)
        self.assertEqual(insertions, [])

    def test_does_not_link_inside_markdown_link(self):
        self._single_term_fixture(["See [the method](http://example.com/method) for info."])
        text, _, insertions = self._linked_text_for_cell()
        self.assertNotIn("{term}", text)
        self.assertEqual(insertions, [])

    def test_does_not_link_inside_image(self):
        self._single_term_fixture(["![a method diagram](img/method.png)"])
        text, _, insertions = self._linked_text_for_cell()
        self.assertNotIn("{term}", text)
        self.assertEqual(insertions, [])

    def test_does_not_link_inside_html_tag_markup(self):
        self._single_term_fixture(['<a name="method">&#8203;</a>\n', "\n", "No prose method here either."])
        text, _, insertions = self._linked_text_for_cell()
        # The attribute value inside the tag must not be linked...
        self.assertNotIn('<a name="{term}', text)
        self.assertIn('<a name="method">', text)
        # ...but plain prose outside the tag is still eligible and gets the first-use link.
        self.assertIn("No prose {term}`method` here either.", text)
        self.assertEqual(len(insertions), 1)

    def test_does_not_link_bare_url(self):
        self._single_term_fixture(["See https://example.com/method for more."])
        text, _, insertions = self._linked_text_for_cell()
        self.assertNotIn("{term}", text)
        self.assertEqual(insertions, [])

    def test_skips_remove_cell(self):
        self._single_term_fixture(["A method hidden here."], metadata={"tags": ["remove-cell"]})
        text, _, insertions = self._linked_text_for_cell()
        self.assertNotIn("{term}", text)
        self.assertEqual(insertions, [])

    def test_skips_figure_cell(self):
        self._single_term_fixture(
            ["A method caption here."],
            metadata={"label": "fig-x", "diagram_source": "img/x.svg", "caption": "A method caption here."},
        )
        text, _, insertions = self._linked_text_for_cell()
        self.assertNotIn("{term}", text)
        self.assertEqual(insertions, [])

    def test_links_eligible_plain_prose(self):
        self._single_term_fixture(["A method is defined here, plainly."])
        text, changed, insertions = self._linked_text_for_cell()
        self.assertEqual(text, "A {term}`method` is defined here, plainly.")
        self.assertTrue(changed)
        self.assertEqual(len(insertions), 1)


# ----------------------------------------------------------------------------
# link: first-occurrence, longest-match, case/plural, scope
# ----------------------------------------------------------------------------


class LinkBehaviorTest(GlossaryTestCase):
    def test_first_occurrence_only(self):
        standard_fixture(self)
        data = glossary.load_terms()
        units_by_title = {u["title"]: u for u in glossary.get_units(data)}
        terms = glossary.get_terms(data)
        all_lectures = glossary.load_toc_notebooks()
        nb, _changed, insertions = glossary.link_lecture(
            self.root / "week01/L01.01_intro.ipynb",
            "week01/L01.01_intro.ipynb",
            terms,
            units_by_title,
            all_lectures,
        )
        cell0 = "".join(nb["cells"][0]["source"])
        cell1 = "".join(nb["cells"][1]["source"])
        self.assertIn("A {term}`method` is a function implementation.", cell0)
        # Later mentions of "method"/"Methods" in cell 1 stay unlinked.
        self.assertNotIn("{term}", cell1)
        method_insertions = [i for i in insertions if i["label"] == "method"]
        self.assertEqual(len(method_insertions), 1)

    def test_longest_match_wins_and_shorter_term_links_later(self):
        self.write_myst(["week03/L03.01_ties.ipynb"])
        self.write_terms(
            units=[{"title": "Unit C", "lectures": ["week03/L03.01_ties.ipynb"]}],
            terms=[
                {
                    "label": "weak tie",
                    "unit": "Unit C",
                    "defined_in": "week03/L03.01_ties.ipynb",
                    "definition": "A connection to a distant part of the network.",
                    "forms": ["weak tie", "weak ties"],
                    "scope": "all",
                },
                {
                    "label": "tie",
                    "unit": "Unit C",
                    "defined_in": "week03/L03.01_ties.ipynb",
                    "definition": "A connection between two nodes.",
                    "forms": ["tie", "ties"],
                    "scope": "all",
                },
            ],
        )
        self.write_nb(
            "week03/L03.01_ties.ipynb",
            [
                md_cell(["# Ties"]),
                md_cell(["A weak tie connects distant friends. Any tie matters too."]),
            ],
        )
        data = glossary.load_terms()
        units_by_title = {u["title"]: u for u in glossary.get_units(data)}
        terms = glossary.get_terms(data)
        all_lectures = glossary.load_toc_notebooks()
        nb, _changed, _insertions = glossary.link_lecture(
            self.root / "week03/L03.01_ties.ipynb",
            "week03/L03.01_ties.ipynb",
            terms,
            units_by_title,
            all_lectures,
        )
        text = "".join(nb["cells"][1]["source"])
        self.assertEqual(
            text,
            "A {term}`weak tie` connects distant friends. Any {term}`tie` matters too.",
        )

    def test_longest_match_blocks_shorter_term_when_winner_already_linked(self):
        self.write_myst(["week09/L09.01_prompts.ipynb"])
        self.write_terms(
            units=[{"title": "Unit D", "lectures": ["week09/L09.01_prompts.ipynb"]}],
            terms=[
                {
                    "label": "prompt injection",
                    "unit": "Unit D",
                    "defined_in": "week09/L09.01_prompts.ipynb",
                    "definition": "An attack that hides instructions inside model input.",
                    "forms": ["prompt injection"],
                    "scope": "all",
                },
                {
                    "label": "prompt",
                    "unit": "Unit D",
                    "defined_in": "week09/L09.01_prompts.ipynb",
                    "definition": "The input text given to a model.",
                    "forms": ["prompt"],
                    "scope": "all",
                },
            ],
        )
        self.write_nb(
            "week09/L09.01_prompts.ipynb",
            [
                md_cell(["# Prompts"]),
                md_cell(
                    [
                        ("Prompt injection matters. Later, prompt injection appears again "
                        "in the same lecture.")
                    ]
                ),
            ],
        )
        data = glossary.load_terms()
        units_by_title = {u["title"]: u for u in glossary.get_units(data)}
        terms = glossary.get_terms(data)
        all_lectures = glossary.load_toc_notebooks()
        nb, _, insertions = glossary.link_lecture(
            self.root / "week09/L09.01_prompts.ipynb",
            "week09/L09.01_prompts.ipynb",
            terms,
            units_by_title,
            all_lectures,
        )
        text = "".join(nb["cells"][1]["source"])
        self.assertEqual(
            text,
            "{term}`Prompt injection <prompt injection>` matters. Later, prompt injection "
            "appears again in the same lecture.",
        )
        # The second "prompt injection" occurrence must not be split into a "prompt" link.
        self.assertNotIn("{term}`prompt`", text)
        self.assertNotIn("{term}`Prompt <prompt>`", text)
        labels = [i["label"] for i in insertions]
        self.assertEqual(labels, ["prompt injection"])

    def test_apply_preserves_notebook_json_style_and_source_shape(self):
        self.write_myst(["week03/L03.01_graphs.ipynb"])
        self.write_terms(
            units=[{"title": "Networks", "lectures": ["week03/L03.01_graphs.ipynb"]}],
            terms=[
                {
                    "label": "graph",
                    "unit": "Networks",
                    "defined_in": "week03/L03.01_graphs.ipynb",
                    "definition": "Nodes and edges.",
                    "forms": ["graph"],
                },
            ],
        )
        path = self.root / "week03/L03.01_graphs.ipynb"
        nb = {
            "cells": [
                {"cell_type": "markdown", "metadata": {}, "source": "# Graphs\n\nA graph \u00b7 links items."},
                {"cell_type": "markdown", "metadata": {}, "source": ["Unchanged list cell.\n"]},
            ],
            "metadata": {},
            "nbformat": 4,
            "nbformat_minor": 5,
        }
        path.parent.mkdir(parents=True, exist_ok=True)
        original = json.dumps(nb, indent=4, ensure_ascii=True) + "\n"
        path.write_text(original)
        data = glossary.load_terms()
        linked, changed, _ = glossary.link_lecture(
            path,
            "week03/L03.01_graphs.ipynb",
            glossary.get_terms(data),
            {u["title"]: u for u in glossary.get_units(data)},
            glossary.load_toc_notebooks(),
        )
        self.assertTrue(changed)
        glossary.write_notebook(path, linked)
        self.assertEqual(
            path.read_text(),
            original.replace("A graph \\u00b7", "A {term}`graph` \\u00b7"),
        )

    def test_equal_length_tie_prefers_in_scope_term(self):
        self.write_myst(["week02/L02.03_packages.ipynb", "week06/L06.01_abm.ipynb"])
        self.write_terms(
            units=[
                {"title": "Julia", "lectures": ["week02/L02.03_packages.ipynb"]},
                {"title": "ABM", "lectures": ["week06/L06.01_abm.ipynb"]},
            ],
            terms=[
                {
                    "label": "environment",
                    "unit": "Julia",
                    "defined_in": "week02/L02.03_packages.ipynb",
                    "definition": "A set of installed packages.",
                    "forms": ["environment"],
                    "scope": "unit",
                },
                {
                    "label": "environment (ABM)",
                    "unit": "ABM",
                    "defined_in": "week06/L06.01_abm.ipynb",
                    "definition": "The space agents act in.",
                    "forms": ["environment"],
                    "scope": "unit",
                },
            ],
        )
        self.write_nb(
            "week06/L06.01_abm.ipynb",
            [md_cell(["# ABM"]), md_cell(["Agents respond to their environment."])],
        )
        data = glossary.load_terms()
        nb, _, insertions = glossary.link_lecture(
            self.root / "week06/L06.01_abm.ipynb",
            "week06/L06.01_abm.ipynb",
            glossary.get_terms(data),
            {u["title"]: u for u in glossary.get_units(data)},
            glossary.load_toc_notebooks(),
        )
        self.assertEqual(
            "".join(nb["cells"][1]["source"]),
            "Agents respond to their {term}`environment <environment (ABM)>`.",
        )
        self.assertEqual([i["label"] for i in insertions], ["environment (ABM)"])

    def test_longest_match_blocks_shorter_term_when_winner_out_of_scope(self):
        self.write_myst(["week08/L08.01_strategies.ipynb", "week09/L09.01_mixed.ipynb"])
        self.write_terms(
            units=[
                {"title": "Unit E", "lectures": ["week08/L08.01_strategies.ipynb"]},
                {"title": "Unit F", "lectures": ["week09/L09.01_mixed.ipynb"]},
            ],
            terms=[
                {
                    "label": "Nash equilibrium",
                    "unit": "Unit E",
                    "defined_in": "week08/L08.01_strategies.ipynb",
                    "definition": "A stable strategy profile.",
                    "forms": ["Nash equilibrium"],
                    "scope": "all",
                },
                {
                    "label": "mixed strategy Nash equilibrium",
                    "unit": "Unit F",
                    "defined_in": "week09/L09.01_mixed.ipynb",
                    "definition": "A Nash equilibrium in randomized strategies.",
                    "forms": ["mixed strategy Nash equilibrium"],
                    "scope": "unit",
                },
            ],
        )
        self.write_nb(
            "week08/L08.01_strategies.ipynb",
            [
                md_cell(["# Strategies"]),
                md_cell(
                    [
                        ("A mixed strategy Nash equilibrium is complex. "
                        "A plain Nash equilibrium is simpler.")
                    ]
                ),
            ],
        )
        data = glossary.load_terms()
        units_by_title = {u["title"]: u for u in glossary.get_units(data)}
        terms = glossary.get_terms(data)
        all_lectures = glossary.load_toc_notebooks()
        nb, _, insertions = glossary.link_lecture(
            self.root / "week08/L08.01_strategies.ipynb",
            "week08/L08.01_strategies.ipynb",
            terms,
            units_by_title,
            all_lectures,
        )
        text = "".join(nb["cells"][1]["source"])
        self.assertEqual(
            text,
            "A mixed strategy Nash equilibrium is complex. "
            "A plain {term}`Nash equilibrium` is simpler.",
        )
        labels = [i["label"] for i in insertions]
        self.assertEqual(labels, ["Nash equilibrium"])

    def test_scope_list_accepts_lecture_paths_mixed_with_unit_titles(self):
        self.write_myst(
            [
                "week01/L01.01_intro.ipynb",
                "week02/L02.01_other.ipynb",
                "week03/L03.01_types.ipynb",
            ]
        )
        self.write_terms(
            units=[
                {"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]},
                {"title": "Unit B", "lectures": ["week02/L02.01_other.ipynb"]},
                {"title": "Unit C", "lectures": ["week03/L03.01_types.ipynb"]},
            ],
            terms=[
                {
                    "label": "token",
                    "unit": "Unit C",
                    "defined_in": "week03/L03.01_types.ipynb",
                    "definition": "A unit of meaning.",
                    "forms": ["token"],
                    "scope": ["week01/L01.01_intro.ipynb", "Unit B"],
                }
            ],
        )
        self.write_nb(
            "week01/L01.01_intro.ipynb", [md_cell(["# Intro"]), md_cell(["A token appears here."])]
        )
        self.write_nb(
            "week02/L02.01_other.ipynb", [md_cell(["# Other"]), md_cell(["A token appears here too."])]
        )
        self.write_nb(
            "week03/L03.01_types.ipynb", [md_cell(["# Types"]), md_cell(["A token appears here as well."])]
        )
        data = glossary.load_terms()
        units_by_title = {u["title"]: u for u in glossary.get_units(data)}
        terms = glossary.get_terms(data)
        all_lectures = glossary.load_toc_notebooks()

        for rel, expect_linked in (
            ("week01/L01.01_intro.ipynb", True),
            ("week02/L02.01_other.ipynb", True),
            ("week03/L03.01_types.ipynb", False),
        ):
            _, _, insertions = glossary.link_lecture(
                self.root / rel, rel, terms, units_by_title, all_lectures
            )
            self.assertEqual(len(insertions), 1 if expect_linked else 0, rel)

    def test_case_and_plural_display_preserved(self):
        self.write_myst(["week01/L01.01_intro.ipynb"])
        self.write_terms(
            units=[{"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]}],
            terms=[
                {
                    "label": "method",
                    "unit": "Unit A",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "A function implementation.",
                    "forms": ["method", "methods"],
                    "scope": "all",
                }
            ],
        )
        self.write_nb(
            "week01/L01.01_intro.ipynb",
            [md_cell(["# Intro"]), md_cell(["Methods are everywhere once you look."])],
        )
        data = glossary.load_terms()
        units_by_title = {u["title"]: u for u in glossary.get_units(data)}
        terms = glossary.get_terms(data)
        all_lectures = glossary.load_toc_notebooks()
        nb, _, _ = glossary.link_lecture(
            self.root / "week01/L01.01_intro.ipynb",
            "week01/L01.01_intro.ipynb",
            terms,
            units_by_title,
            all_lectures,
        )
        text = "".join(nb["cells"][1]["source"])
        self.assertEqual(text, "{term}`Methods <method>` are everywhere once you look.")

    def test_scope_unit_restricts_linking_to_home_unit_lectures(self):
        standard_fixture(self)
        data = glossary.load_terms()
        units_by_title = {u["title"]: u for u in glossary.get_units(data)}
        terms = glossary.get_terms(data)
        all_lectures = glossary.load_toc_notebooks()

        # week01 lectures do not mention Nash equilibrium so this is a no-op either way,
        # but scope should still exclude week01 even if we add a mention.
        self.write_nb(
            "week01/L01.01_intro.ipynb",
            [md_cell(["# Intro"]), md_cell(["A Nash equilibrium would not apply in Unit A."])],
        )
        _nb, _changed, insertions = glossary.link_lecture(
            self.root / "week01/L01.01_intro.ipynb",
            "week01/L01.01_intro.ipynb",
            terms,
            units_by_title,
            all_lectures,
        )
        nash_insertions = [i for i in insertions if i["label"] == "Nash equilibrium"]
        self.assertEqual(nash_insertions, [])

        _nb, _changed, insertions = glossary.link_lecture(
            self.root / "week02/L02.01_types.ipynb",
            "week02/L02.01_types.ipynb",
            terms,
            units_by_title,
            all_lectures,
        )
        nash_insertions = [i for i in insertions if i["label"] == "Nash equilibrium"]
        self.assertEqual(len(nash_insertions), 1)

    def test_scope_list_restricts_linking_to_named_units(self):
        self.write_myst(["week01/L01.01_intro.ipynb", "week02/L02.01_types.ipynb"])
        self.write_terms(
            units=[
                {"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]},
                {"title": "Unit B", "lectures": ["week02/L02.01_types.ipynb"]},
            ],
            terms=[
                {
                    "label": "token",
                    "unit": "Unit B",
                    "defined_in": "week02/L02.01_types.ipynb",
                    "definition": "A unit of meaning.",
                    "forms": ["token"],
                    "scope": ["Unit A"],
                }
            ],
        )
        self.write_nb(
            "week01/L01.01_intro.ipynb", [md_cell(["# Intro"]), md_cell(["A token appears here."])]
        )
        self.write_nb(
            "week02/L02.01_types.ipynb", [md_cell(["# Types"]), md_cell(["A token appears here too."])]
        )
        data = glossary.load_terms()
        units_by_title = {u["title"]: u for u in glossary.get_units(data)}
        terms = glossary.get_terms(data)
        all_lectures = glossary.load_toc_notebooks()

        _, _, insertions_a = glossary.link_lecture(
            self.root / "week01/L01.01_intro.ipynb",
            "week01/L01.01_intro.ipynb",
            terms,
            units_by_title,
            all_lectures,
        )
        self.assertEqual(len(insertions_a), 1)

        _, _, insertions_b = glossary.link_lecture(
            self.root / "week02/L02.01_types.ipynb",
            "week02/L02.01_types.ipynb",
            terms,
            units_by_title,
            all_lectures,
        )
        self.assertEqual(insertions_b, [])


# ----------------------------------------------------------------------------
# link: idempotency, cmd_link end-to-end
# ----------------------------------------------------------------------------


class LinkApplyTest(GlossaryTestCase):
    def test_apply_is_idempotent(self):
        standard_fixture(self)

        class Args:
            apply = True
            lecture = None

        glossary.cmd_link(Args())
        first_bytes = {
            rel: (self.root / rel).read_bytes()
            for rel in glossary.load_toc_notebooks()
        }
        glossary.cmd_link(Args())
        second_bytes = {
            rel: (self.root / rel).read_bytes()
            for rel in glossary.load_toc_notebooks()
        }
        self.assertEqual(first_bytes, second_bytes)

    def test_dry_run_does_not_write(self):
        standard_fixture(self)
        before = (self.root / "week01/L01.01_intro.ipynb").read_bytes()

        class Args:
            apply = False
            lecture = None

        glossary.cmd_link(Args())
        after = (self.root / "week01/L01.01_intro.ipynb").read_bytes()
        self.assertEqual(before, after)


# ----------------------------------------------------------------------------
# unlink
# ----------------------------------------------------------------------------


class UnlinkTest(GlossaryTestCase):
    def test_unlink_round_trip_restores_original_text(self):
        standard_fixture(self)
        originals = {
            rel: (self.root / rel).read_bytes() for rel in glossary.load_toc_notebooks()
        }

        class LinkArgs:
            apply = True
            lecture = None

        glossary.cmd_link(LinkArgs())
        linked = {rel: (self.root / rel).read_bytes() for rel in glossary.load_toc_notebooks()}
        self.assertNotEqual(originals, linked)

        class UnlinkArgs:
            apply = True

        glossary.cmd_unlink(UnlinkArgs())
        restored = {rel: (self.root / rel).read_bytes() for rel in glossary.load_toc_notebooks()}

        for rel in originals:
            original_text = "".join(
                "".join(c["source"]) for c in json.loads(originals[rel])["cells"]
            )
            restored_text = "".join(
                "".join(c["source"]) for c in json.loads(restored[rel])["cells"]
            )
            self.assertEqual(original_text, restored_text, rel)


# ----------------------------------------------------------------------------
# check: FAIL rules (one test per rule, per Main's hardening request)
# ----------------------------------------------------------------------------


class CheckFailRulesTest(GlossaryTestCase):
    def _minimal_fixture(self, definition_extra="", role_in_cell="", cell_metadata=None, cell_type="markdown"):
        self.write_myst(["week01/L01.01_intro.ipynb"])
        self.write_terms(
            units=[{"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]}],
            terms=[
                {
                    "label": "method",
                    "unit": "Unit A",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "A function implementation." + definition_extra,
                    "forms": ["method"],
                    "scope": "all",
                }
            ],
        )
        cells = [md_cell(["# Intro\n", "\n", "A method is shown here."])]
        if role_in_cell:
            cells.append({"cell_type": cell_type, "metadata": cell_metadata or {}, "source": [role_in_cell]})
        self.write_nb("week01/L01.01_intro.ipynb", cells)
        glossary.GLOSSARY_PATH.write_text(
            glossary.render_glossary_text(glossary.load_terms(), root=self.root)
        )

    def test_rule1_unknown_label_fails_with_did_you_mean(self):
        self._minimal_fixture(role_in_cell="See {term}`methdo` here.")
        errors, _ = glossary.run_check(self.root)
        msgs = [e.message for e in errors if "unknown label" in e.message]
        self.assertEqual(len(msgs), 1)
        self.assertIn("did you mean 'method'", msgs[0])

    def test_rule2_malformed_role_unbalanced_backticks(self):
        self._minimal_fixture(role_in_cell="See {term}`method here.")
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("unbalanced backticks" in e.message for e in errors))

    def test_rule2_malformed_role_empty_label(self):
        self._minimal_fixture(role_in_cell="See {term}`` here.")
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("empty label" in e.message for e in errors))

    def test_rule2_malformed_role_angle_without_display(self):
        self._minimal_fixture(role_in_cell="See {term}`<method>` here.")
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("no display text" in e.message for e in errors))

    def test_rule2_wrong_role_name_terms_plural(self):
        self._minimal_fixture(role_in_cell="See {terms}`method` here.")
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("not a valid term role" in e.message for e in errors))

    def test_rule2_wrong_role_name_glossary_inline(self):
        self._minimal_fixture(role_in_cell="See {glossary}`method` used inline.")
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("not a valid term role" in e.message for e in errors))

    def test_rule3_role_inside_code_cell_fails(self):
        self._minimal_fixture(role_in_cell="x = 1  # {term}`method`", cell_type="code")
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("code cell" in e.message for e in errors))

    def test_rule3_role_inside_heading_fails(self):
        self._minimal_fixture(role_in_cell="## A {term}`method` heading")
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("heading line" in e.message for e in errors))

    def test_rule3_role_inside_inline_code_fails(self):
        self._minimal_fixture(role_in_cell="Use `{term}`method`` style.")
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("inline code" in e.message for e in errors))

    def test_rule3_role_inside_math_fails(self):
        self._minimal_fixture(role_in_cell="Inline $ {term}`method` $ math.")
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("math" in e.message for e in errors))

    def test_rule3_role_inside_remove_cell_fails(self):
        self._minimal_fixture(
            role_in_cell="See {term}`method` hidden.", cell_metadata={"tags": ["remove-cell"]}
        )
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("hidden (remove-cell)" in e.message for e in errors))

    def test_rule4_glossary_md_stale_fails(self):
        self._minimal_fixture()
        glossary.GLOSSARY_PATH.write_text("stale")
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("stale" in e.message for e in errors))

    def test_rule5_duplicate_labels_case_insensitive_fails(self):
        self.write_myst(["week01/L01.01_intro.ipynb"])
        self.write_terms(
            units=[{"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]}],
            terms=[
                {
                    "label": "method",
                    "unit": "Unit A",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "A function implementation.",
                    "forms": ["method"],
                },
                {
                    "label": "Method",
                    "unit": "Unit A",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "Another definition.",
                    "forms": ["Method"],
                },
            ],
        )
        self.write_nb("week01/L01.01_intro.ipynb", [md_cell(["# Intro\n", "\n", "A method appears."])])
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("duplicate label" in e.message for e in errors))

    def test_rule5_ambiguous_duplicate_form_overlapping_scope_fails(self):
        self.write_myst(["week01/L01.01_intro.ipynb"])
        self.write_terms(
            units=[{"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]}],
            terms=[
                {
                    "label": "alpha",
                    "unit": "Unit A",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "First term. A shared appears here.",
                    "forms": ["shared"],
                    "scope": "all",
                },
                {
                    "label": "beta",
                    "unit": "Unit A",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "Second term.",
                    "forms": ["shared"],
                    "scope": "all",
                },
            ],
        )
        self.write_nb(
            "week01/L01.01_intro.ipynb", [md_cell(["# Intro\n", "\n", "A shared word appears."])]
        )
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("ambiguous linking" in e.message for e in errors))

    def test_rule5_unknown_unit_fails(self):
        self.write_myst(["week01/L01.01_intro.ipynb"])
        self.write_terms(
            units=[{"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]}],
            terms=[
                {
                    "label": "method",
                    "unit": "Nonexistent Unit",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "A function implementation.",
                    "forms": ["method"],
                }
            ],
        )
        self.write_nb("week01/L01.01_intro.ipynb", [md_cell(["# Intro\n", "\n", "A method appears."])])
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("unit 'Nonexistent Unit' is not defined" in e.message for e in errors))

    def test_rule5_scope_list_unknown_lecture_path_fails(self):
        self.write_myst(["week01/L01.01_intro.ipynb"])
        self.write_terms(
            units=[{"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]}],
            terms=[
                {
                    "label": "method",
                    "unit": "Unit A",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "A function implementation.",
                    "forms": ["method"],
                    "scope": ["week99/L99.99_ghost.ipynb"],
                }
            ],
        )
        self.write_nb("week01/L01.01_intro.ipynb", [md_cell(["# Intro\n", "\n", "A method appears."])])
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(
            any(
                "scope references lecture 'week99/L99.99_ghost.ipynb' not in myst.yml" in e.message
                for e in errors
            )
        )

    def test_rule5_scope_list_valid_lecture_path_passes(self):
        self.write_myst(["week01/L01.01_intro.ipynb", "week02/L02.01_other.ipynb"])
        self.write_terms(
            units=[
                {"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]},
                {"title": "Unit B", "lectures": ["week02/L02.01_other.ipynb"]},
            ],
            terms=[
                {
                    "label": "method",
                    "unit": "Unit A",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "A function implementation.",
                    "forms": ["method"],
                    "scope": ["week01/L01.01_intro.ipynb", "week02/L02.01_other.ipynb"],
                }
            ],
        )
        self.write_nb("week01/L01.01_intro.ipynb", [md_cell(["# Intro\n", "\n", "A method appears."])])
        self.write_nb("week02/L02.01_other.ipynb", [md_cell(["# Other"])])
        errors, _ = glossary.run_check(self.root)
        self.assertEqual([e for e in errors if "scope references" in e.message], [])

    def test_rule5_defined_in_not_in_myst_yml_fails(self):
        self.write_myst(["week01/L01.01_intro.ipynb"])
        self.write_terms(
            units=[{"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]}],
            terms=[
                {
                    "label": "method",
                    "unit": "Unit A",
                    "defined_in": "week99/L99.99_ghost.ipynb",
                    "definition": "A function implementation.",
                    "forms": ["method"],
                }
            ],
        )
        self.write_nb("week01/L01.01_intro.ipynb", [md_cell(["# Intro\n", "\n", "A method appears."])])
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("not listed in myst.yml" in e.message for e in errors))

    def test_rule5_defined_in_not_in_unit_fails(self):
        self.write_myst(["week01/L01.01_intro.ipynb", "week02/L02.01_types.ipynb"])
        self.write_terms(
            units=[
                {"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]},
                {"title": "Unit B", "lectures": ["week02/L02.01_types.ipynb"]},
            ],
            terms=[
                {
                    "label": "method",
                    "unit": "Unit A",
                    "defined_in": "week02/L02.01_types.ipynb",
                    "definition": "A function implementation.",
                    "forms": ["method"],
                }
            ],
        )
        self.write_nb("week01/L01.01_intro.ipynb", [md_cell(["# Intro\n", "\n", "A method appears."])])
        self.write_nb("week02/L02.01_types.ipynb", [md_cell(["# Types\n", "\n", "A method appears."])])
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("is not in unit 'Unit A'" in e.message for e in errors))

    def test_rule5_empty_definition_fails(self):
        self.write_myst(["week01/L01.01_intro.ipynb"])
        self.write_terms(
            units=[{"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]}],
            terms=[
                {
                    "label": "method",
                    "unit": "Unit A",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "   ",
                    "forms": ["method"],
                }
            ],
        )
        self.write_nb("week01/L01.01_intro.ipynb", [md_cell(["# Intro\n", "\n", "A method appears."])])
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("empty definition" in e.message for e in errors))

    def test_rule5_definition_unresolved_term_reference_fails(self):
        self.write_myst(["week01/L01.01_intro.ipynb"])
        self.write_terms(
            units=[{"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]}],
            terms=[
                {
                    "label": "method",
                    "unit": "Unit A",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "See {term}`nonexistent` for contrast.",
                    "forms": ["method"],
                }
            ],
        )
        self.write_nb("week01/L01.01_intro.ipynb", [md_cell(["# Intro\n", "\n", "A method appears."])])
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("references unknown term" in e.message for e in errors))

    def test_rule5_defined_in_missing_form_in_prose_fails(self):
        self.write_myst(["week01/L01.01_intro.ipynb"])
        self.write_terms(
            units=[{"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]}],
            terms=[
                {
                    "label": "method",
                    "unit": "Unit A",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "A function implementation.",
                    "forms": ["method"],
                }
            ],
        )
        self.write_nb(
            "week01/L01.01_intro.ipynb", [md_cell(["# Intro\n", "\n", "This lecture never mentions it."])]
        )
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("never mentions any of its forms" in e.message for e in errors))

    def test_rule6_over_linking_same_label_twice_fails(self):
        self._minimal_fixture(
            role_in_cell="First {term}`method` and second {term}`method` in the same lecture."
        )
        errors, _ = glossary.run_check(self.root)
        self.assertTrue(any("is linked 2 times" in e.message for e in errors))


# ----------------------------------------------------------------------------
# check: WARN rules + overall exit codes
# ----------------------------------------------------------------------------


class CheckWarnRulesTest(GlossaryTestCase):
    def test_warns_on_never_linked_term_and_zero_link_lecture(self):
        self.write_myst(["week01/L01.01_intro.ipynb"])
        self.write_terms(
            units=[{"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]}],
            terms=[
                {
                    "label": "method",
                    "unit": "Unit A",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "A function implementation.",
                    "forms": ["method"],
                }
            ],
        )
        self.write_nb("week01/L01.01_intro.ipynb", [md_cell(["# Intro\n", "\n", "A method appears."])])
        glossary.GLOSSARY_PATH.write_text(
            glossary.render_glossary_text(glossary.load_terms(), root=self.root)
        )
        errors, warnings = glossary.run_check(self.root)
        self.assertEqual(errors, [])
        self.assertTrue(any("never linked" in w.message for w in warnings))
        self.assertTrue(any("zero glossary links" in w.message for w in warnings))
        self.assertTrue(any("unlinked prose occurrences" in w.message for w in warnings))

    def test_no_warnings_when_term_is_linked_everywhere(self):
        self.write_myst(["week01/L01.01_intro.ipynb"])
        self.write_terms(
            units=[{"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]}],
            terms=[
                {
                    "label": "method",
                    "unit": "Unit A",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "A function implementation.",
                    "forms": ["method"],
                }
            ],
        )
        self.write_nb(
            "week01/L01.01_intro.ipynb",
            [md_cell(["# Intro\n", "\n", "A {term}`method` appears."])],
        )
        glossary.GLOSSARY_PATH.write_text(
            glossary.render_glossary_text(glossary.load_terms(), root=self.root)
        )
        errors, warnings = glossary.run_check(self.root)
        self.assertEqual(errors, [])
        self.assertEqual(
            [w for w in warnings if "never linked" in w.message or "zero glossary links" in w.message],
            [],
        )


class CheckExitCodeTest(GlossaryTestCase):
    def test_cmd_check_nonzero_exit_on_unknown_label(self):
        self.write_myst(["week01/L01.01_intro.ipynb"])
        self.write_terms(
            units=[{"title": "Unit A", "lectures": ["week01/L01.01_intro.ipynb"]}],
            terms=[
                {
                    "label": "method",
                    "unit": "Unit A",
                    "defined_in": "week01/L01.01_intro.ipynb",
                    "definition": "A function implementation.",
                    "forms": ["method"],
                }
            ],
        )
        self.write_nb(
            "week01/L01.01_intro.ipynb",
            [md_cell(["# Intro\n", "\n", "A method appears."]), md_cell(["See {term}`ghost` here."])],
        )
        glossary.GLOSSARY_PATH.write_text(
            glossary.render_glossary_text(glossary.load_terms(), root=self.root)
        )

        class Args:
            pass

        self.assertEqual(glossary.cmd_check(Args()), 1)

    def test_cmd_check_zero_exit_on_clean_fixture(self):
        standard_fixture(self)
        glossary.GLOSSARY_PATH.write_text(
            glossary.render_glossary_text(glossary.load_terms(), root=self.root)
        )

        class LinkArgs:
            apply = True
            lecture = None

        glossary.cmd_link(LinkArgs())

        class Args:
            pass

        self.assertEqual(glossary.cmd_check(Args()), 0)


if __name__ == "__main__":
    unittest.main()
