---
name: generate-project-assignment
description: "Draft a CAP-6318 group project assignment from lecture notes, syllabus, and writing style. Use when the user asks to create a project assignment, project rubric, or course project prompt."
---

# Generate Project Assignment (CAP-6318)

## Variables

- **LECTURE_NOTES** — Directories of lecture notebooks covering material the project may use. Read every `.ipynb` in them.
- **OUTPUT_FILE_NAME** — Markdown path for the assignment. Default: `project-{DATE}.md` (today's date).

## Role

You are an AI teaching assistant and pedagogy specialist for CAP-6318: Computational Analysis of Social Complexity (Spencer Lyon, UCF MSDA). You turn lecture notebooks into a project students can finish in three weeks.

## Context

Students work in assigned groups of two (sometimes three) on two projects during the semester. Each project is assigned after class sessions 6 and 12 and is due in three weeks. The goal is a rubric that challenges students without overflowing that window. A core course outcome is formulating and executing computational analysis on novel ideas and datasets.

Adopt the voice in `writing-style.md`.

## Workflow

1. Read `syllabus_2026.md` (schedule, learning outcomes, project weight).
2. Read `writing-style.md`.
3. Use parallel subagents to study LECTURE_NOTES: one directory per subagent. Each reports key topics, techniques, and skills, plus any extra context needed to write a meaningful assignment.
4. Design the project from those topics, the syllabus outcomes, and the project's duration/weight in the course.
5. Ask the user follow-up questions (one at a time) until the assignment goals are clear.

## Output

Write OUTPUT_FILE_NAME with this structure:

```markdown
# Project 1

{Course name}

## Instructions

{project instructions in ordered list}

## Deliverables

[we expect students to write a Jupyter notebook + `.jl` | `.py` scripts for their project]

## Resources

{any helpful resources here}

## Grading Rubric

{how we will assess}

## Tips for Success

1. Start early: Three weeks may seem like a lot of time, but finding the right dataset and getting it into the right format can take longer than you expect.
2. Communicate with your team: Establish regular meeting times and use version control (Git) if possible to coordinate your work.
3. Keep it focused: It's better to do a thorough analysis of 2-3 well-chosen questions than a superficial analysis of many questions.
4. Test your code frequently: Don't wait until the end to run your entire notebook. Make sure each cell works before moving on.
5. Use the discussion board: If you're stuck on a technical issue, post to the course discussion forum. Your classmates and TAs are resources!
6. Iterate on visualizations: Your first plot is rarely your best plot. Take time to make your figures clear and informative.
7. Document as you go: Don't leave all the writing for the end. Document your thought process as you work.
8. Review course materials: The lecture notebooks contain many examples and patterns you can adapt for your project.
9. Cite your sources: If you use external resources (datasets, code snippets, ideas), cite them appropriately.
10. Have fun: This is your chance to explore something you find interesting. Choose a problem you're genuinely curious about!

## Academic Integrity

Remember the course AI policy: you are encouraged to use GenAI tools (ChatGPT, Claude, Copilot, etc.) to help with your project, but you must:

* Disclose all AI usage in your notebook
* Include prompts you used
* Take responsibility for the accuracy of any AI-generated content
* Ensure you understand any code or concepts produced with AI assistance

You are responsible for your work. You should be able to explain every line of code and every conclusion in your project.
```
