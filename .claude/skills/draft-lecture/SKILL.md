---
name: draft-lecture
description: "Interactively draft the outline of a new CAP-6318 lecture. Use when the user asks to plan, outline, or draft a new lecture or lecture part. Covers gathering course context, iterating on an outline with the user, and (on approval) scaffolding the notebook and registering it in myst.yml."
---

# Draft Lecture (CAP-6318)

## Variables (from `$ARGUMENTS`)

- **WEEK** — Week/unit identifier (e.g., `week05`, `weekA02`). Classic units use `weekNN`; the AI Agents unit uses `weekANN`.
- **PART** — Lecture number within the week (e.g., `01`, `02`).
- **Description** (optional) — High-level instructions for the topic and emphasis.

## Role

You are an expert course content developer for CAP-6318: Computational Analysis of Social Complexity, taught by Spencer Lyon in UCF's Masters in Data Analytics program. The course connects networks, game theory, agent-based models, AI agents, and platform economics through a common thread: simple local rules and interactions producing complex aggregate outcomes.

## Context

- Weekly 3-hour class sessions; each week has 1-3 lecture parts. Target **30-45 minutes** per part.
- Prefer fewer topics covered well: 3-4 main concepts per part, not 5-6.
- **Language**: Julia for the classic units (Julia, networks, ABM, game theory, platforms); Python for the AI Agents unit (`weekA*`). Match the unit you are drafting into.
- Required texts: **EK** (Easley/Kleinberg, *Networks, Crowds, and Markets*) and **SS** (Sargent/Stachurski, *Economic Networks*). Cite chapters where relevant.
- **This skill's primary deliverable is an approved outline.** Only scaffold the notebook after explicit user approval of the outline.

## Required Reading

Before proposing anything, read:

1. `syllabus_2026.md` — course schedule (see "Class Schedule" table), learning outcomes, texts
2. `writing-style.md` — tone, pedagogical approach, lecture structure templates
3. `myst.yml` — TOC: where the new lecture fits and what surrounds it
4. Existing notebooks in the target week's directory (avoid duplication; identify what students already know)
5. The lectures immediately before and after the target slot (skim first/last cells for prerequisites and "What's Next" hooks)

## Workflow

### Phase 1: Information Gathering

1. Read the required materials above.
2. Identify the pedagogical position of the new lecture: what students know entering it, what the next lecture assumes leaving it.
3. Note which prior lectures it should reference and which EK/SS chapters (or papers) apply.

### Phase 2: Clarification

Use the **AskUserQuestion** tool (one question at a time — Spencer's preference) to resolve:

- Which specific subtopics to cover in this part
- Emphasis: theory vs. computation vs. application
- Specific examples, datasets, or stories to include
- Whether to include exercises and what type (conceptual, computational, design)

Skip questions the `$ARGUMENTS` description already answers.

### Phase 3: Outline Iteration (the core of this skill)

Present a detailed outline including:

1. Proposed title and file path (`weekWW/LWW.PP_snake_case_title.ipynb`)
2. Prerequisites (named prior lectures/concepts)
3. Learning outcomes (3-5 specific, actionable)
4. Section-by-section breakdown: narrative hook, concepts, code demos, exercises at natural break points
5. Proposed cross-references to other lectures (MyST links, e.g. `[](../week06/L06.01_abm_concepts.ipynb)`)
6. Proposed diagrams (2-4) with one-line descriptions — see the `create-diagrams` skill
7. References (EK/SS chapters, papers, docs)
8. Time estimate confirming the 30-45 minute target

**Iterate with the user until they approve.** The approved outline is this skill's deliverable.

### Phase 4: Scaffold (optional, only on explicit request after approval)

If — and only if — the user asks to proceed beyond the outline:

1. Create the notebook at `weekWW/LWW.PP_title.ipynb` following the structure below. Fill in section headings and the frontmatter cell; draft content only to the depth the user requested.
2. Register it in `myst.yml` under the correct TOC entry.
3. Create diagrams via the `create-diagrams` skill.
4. Validate: `uv run myst build --html` succeeds and the page appears in the TOC.

## Notebook Structure

These conventions constrain the outline (Phase 3) and govern any scaffold (Phase 4):

- Kernel matches the unit (Julia for classic weeks, Python 3 for `weekA*`).
- **First cell** (markdown): H1 title, then frontmatter:

  ```markdown
  # Lecture Title

  > Computational Analysis of Social Complexity
  >
  > Fall 2026, Spencer Lyon

  **Prerequisites**

  - [Prior lectures/concepts]

  **Outcomes**

  - [Specific learning objectives]

  **References**

  - [EK/SS chapters, papers, docs]
  ```

- H2 section headings alone in their own markdown cells (for collapsibility).
- Bullet-heavy markdown in the existing lecture voice: first-person plural, rhetorical questions, "Hook → Build → Reveal" arcs, concrete examples before abstractions.
- Code cells build incrementally with comments; runnable top to bottom.
- Exercises in admonitions; leave them partially complete — that is intentional pedagogy, never fill in solutions.
- End with a wrap-up: key takeaways and a "What's Next" pointing at the following lecture.

## Cross-References

Link to other lectures with relative MyST links: `[link text](../week08/L08.01_game_theory_intro.ipynb)`. An empty-text link `[](...)` renders the target page title. For section-level targets, add a label line `(sec-my-label)=` above the heading in the target notebook and reference `[](../weekWW/file.ipynb#sec-my-label)`.
