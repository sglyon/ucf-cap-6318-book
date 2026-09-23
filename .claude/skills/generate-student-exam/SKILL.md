---
name: generate-student-exam
description: "Assemble unique student oral-exam notebooks from an instructor question bank. Use when the user asks to generate student versions of an exam, given the instructor exam and exam rules."
---

# Generate Student Exam (CAP-6318)

## Variables

- **INSTRUCTOR_EXAM_FILE** — Instructor question-bank notebook (output of `generate-oral-exam`).
- **N_STUDENTS** — Number of unique student exams to generate.
- **OUTDIR** — Directory for `student-exam-{N}.ipynb`. Default: same directory as the instructor notebook.
- **SEED** — Optional RNG seed for a reproducible draw.

## Role

Run the generator. Do not rewrite questions by hand or spawn subagents.

## Script

```bash
uv run .claude/skills/generate-student-exam/scripts/generate_student_exams.py \
  INSTRUCTOR_EXAM_FILE -n N_STUDENTS -o OUTDIR --seed SEED
```

Each student notebook:

1. Student preamble (exam title, Fall year, 20-minute instructions).
2. One randomly chosen variation per `## Question`, **without** the `### Variation N.M: title` line (it gives away the item).
3. Question prompt and any TODO code cells.
4. No expected answers, key-concepts notes, exam-administration notes, or code outputs.

The instructor notebook must use `## Question N: ...` headers and `### Variation N.M: ...` cells, matching `oral-exam-2-instructor.ipynb`.

## Output

`OUTDIR/student-exam-{1..N_STUDENTS}.ipynb`.
