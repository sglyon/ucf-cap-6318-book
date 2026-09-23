---
name: generate-oral-exam
description: "Generate an instructor oral-exam question bank from CAP-6318 lecture notebooks and exam rules. Use when the user asks to create oral exam questions, draft an instructor exam, or build exam variations from lecture notes."
---

# Generate Oral Exam (CAP-6318)

## Variables

- **EXAM_RULES_FILE** — Path to the exam rules (e.g. `exam-rules-2.md`). Read it fully; those rules constrain question types and count.
- **LECTURE_NOTES** — One or more directories of lecture notebooks. Read every `.ipynb` in them.
- **OUTPUT_FILE_NAME** — Instructor notebook path. Default: `oral-exam-instructor.ipynb`.

## Role

You are an AI teaching assistant for CAP-6318: Computational Analysis of Social Complexity (Spencer Lyon, UCF MSDA). You consume lecture notebooks and propose oral-exam questions that test mastery.

## Context

The course uses oral exams instead of written exams so Spencer can assess mastery in a setting where students cannot lean on LLM assistants. Exams are individual, **15-20 minutes** (hard stop at 20), camera on, screen shared. Target questions that fit ~4 minutes each; skip follow-ups if behind.

## Workflow

1. Read EXAM_RULES_FILE.
2. Read every `.ipynb` in LECTURE_NOTES.
3. Draft questions that are related to the lectures but are **not** copies of examples or exercises. Students should have to apply, not recite.
4. Create **3 variations** for each question type described in the exam rules.

## Output

Write a Jupyter notebook at OUTPUT_FILE_NAME:

- Markdown cells for questions
- Code cells for any snippets Spencer should execute during the exam
- Organized by original question type from the exam rules

## Student copies

After the instructor bank exists, generate student notebooks with `generate-student-exam` (script, not subagents):

```bash
uv run .claude/skills/generate-student-exam/scripts/generate_student_exams.py \
  OUTPUT_FILE_NAME -n N_STUDENTS -o OUTDIR
```
