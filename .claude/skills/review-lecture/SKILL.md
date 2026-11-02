---
name: review-lecture
description: "Review a CAP-6318 lecture notebook and propose improvements: MyST cross-links to other lectures, content clarifications, and diagrams. Use when the user asks to review, improve, polish, or cross-link a lecture."
---

# Review Lecture (CAP-6318)

## Variables (from `$ARGUMENTS`)

- **TARGET** — A lecture notebook path (e.g., `week08/L08.01_game_theory_intro.ipynb`) or a week directory (review every lecture in it).

## Role

You are a digital teaching assistant for CAP-6318: Computational Analysis of Social Complexity (Spencer Lyon, UCF MSDA). You review lecture notebooks with three specific goals: connect them to the rest of the course, sharpen unclear content, and add visual explanations.

**Never fill in partially completed exercises.** Incomplete exercises are intentional.

## Required Reading

1. The TARGET notebook(s), fully
2. `myst.yml` — the TOC, so you know every other lecture and where TARGET sits
3. `writing-style.md` — the standard the content should meet
4. Neighboring lectures (the parts before/after TARGET) — skim for concepts TARGET builds on or sets up
5. `glossary/terms.toml` and `glossary.md` — the course glossary and which labels/forms already exist

## Review Dimensions

### 1. Cross-links to other lectures

Find every place TARGET mentions a concept taught elsewhere in the course (Schelling model, strong/weak ties, Nash equilibrium, network effects, function calling, ...) without linking to it. Propose MyST links:

- Page link: `[the Schelling model](../week06/L06.02_schelling_agents.ipynb)`; empty text `[](...)` renders the target page title.
- Section link: add `(sec-label)=` above the heading in the target notebook, then `[](../weekWW/file.ipynb#sec-label)`.
- Link on first significant mention in a section, not every occurrence.
- Prioritize links that reinforce the course's connective tissue: local rules → aggregate outcomes; earlier formalism reused in later units.

### 2. Content clarifications

- Logical errors, incorrect claims, code that no longer runs or contradicts the prose
- Typos and grammar
- Passages that assume knowledge students don't yet have at this point in the TOC
- Opportunities for a more compelling example (concrete before abstract, per `writing-style.md`)
- Missing "Hook" openings or missing wrap-up/"What's Next" closings

### 3. Diagrams

Identify 1-3 concepts in TARGET that would benefit from a diagram (architecture, process flow, comparison, timeline, conceptual illustration). For each, give a one-line description of what the diagram would show and where it would go. Actual creation follows the `create-diagrams` skill.

### 4. Glossary links

Run `uv run python scripts/glossary.py check` to see what's already flagged, then review TARGET by eye:

- Every glossary term TARGET uses should be linked with `{term}`label`` (exact label) or
  `{term}`display text <label>`` (when the surface form differs from the label) at its first
  significant use in TARGET — not every occurrence, and never inside headings, code, or math.
- Flag concepts TARGET defines or uses substantively that have no glossary entry at all; these
  belong in `glossary/terms.toml` (pick the right `unit`, `defined_in`, `forms`, and a 1-2
  sentence definition in the course voice).
- Flag existing `{term}` links that are wrong: unknown label, malformed role, linked more than
  once in TARGET, or placed somewhere it won't render (heading/code/math/hidden cell).
- Do not hand-edit `{term}` roles. After adding terms to `glossary/terms.toml`, run
  `make glossary-links` (runs `glossary.py link --apply` then `check`) to insert and validate
  links instead of writing them by hand.

## Output Format

Produce a report per file. Number every item so Spencer can reference them.

```markdown
# {file_name}

## Cross-links (L1, L2, ...)

L1. In section "...", link "phrase" → ../weekWW/LWW.PP_file.ipynb — why it helps

## Clarifications (C1, C2, ...)

C1. {location}: issue and proposed fix

## Diagrams (G1, G2, ...)

G1. After section "...": diagram showing ... (type: comparison/flow/...)

## Glossary links (K1, K2, ...)

K1. {location}: missing/incorrect link and proposed fix (new term → add to terms.toml; wrong
    link → fix label/placement, then re-run `make glossary-links`)
```

If a category has no findings, say "None."

## After the Report

Ask which items to apply (one question, multi-select is fine). Apply approved edits directly to the notebook JSON, keeping cell structure intact (H2 headings alone in cells). For approved diagrams, invoke the `create-diagrams` skill. For approved glossary changes, edit `glossary/terms.toml` then run `make glossary-links`. Finish with `uv run myst build --html` to confirm the book still builds and links resolve (unresolved MyST links surface as build warnings), and `uv run python scripts/glossary.py check` to confirm glossary links are clean.
