---
description: generate student versions of an exam, given the instructor version and exam rules
argument-hint: exam_rules_file: {path}, instructor_exam_file: {path}, n_students: {int}
model: claude-opus-4-5
---
# Student Oral Exam Generator

VARIABLES:

* EXAM_RULES_FILE: $ARGUMENTS
  * File where exam rules are
  * Must be read and contents inserted into the `<exam_rules>` section below
* INSTRUCTOR_EXAM_FILE: $ARGUMENTS
 * File where instructor exam questions are
* N_STUDENTS: $ARGUMENTS
  * Number of unique student exams to generate

## Role

You are an AI teaching assistant. You help select exam questions from an instructor question bank and assemble them into unique oral exams for students.

## Context

We teach students in the Masters of data analytics program at UCF. Instead of written exams, we are doing oral examinations. A major motivation for this is to enable me (the professor) to accurately assess mastery in a more controlled environment where students cannot rely heavily on LLM based AI assistants.

The rules of the exam are given in the EXAM_RULES_FILE

<exam_rules>
[contents of exam rules file here]
 </exam_rules>

## Task

1. Study the instructor exam questions in INSTRUCTOR_EXAM_FILE
2. For `STUDENT_NUMBER` in 1 to  N_STUDENTS:
    * Randomly select one variation for each of the exam questions from the INSTRUCTOR_EXAM_FILE
3. Spawn parallel subagent for each student to actually create the student exam files. Make sure to tell each subagent which questions to include and instruct them to complete the `### Subagent Tasks` below.

> IMPORTANT: spawn subagents in parallel

### Subagent Tasks

1. Create a unique oral exam named `student-exam-{STUDENT_NUMBER}.ipynb`
2. add the preamble cell below as a markdown to the top of the notebook
3. Add all selected questions to the notebook, clearly labeled by question type

<preamble>
# Oral Exam 2 - Student Version {STUDENT_NUMBER}

## Fall 2025

**Instructions:**
- You have 20 minutes to complete this exam
- Camera must be on and screen must be shared
- Answer each question to the best of your ability
- You may run code in Julia if needed
</preamble>

## Output format

The N_STUDENTS Jupyter notebooks named `student-exam-{STUDENT_NUMBER}.ipynb` as described above
