# Assignment Generator

VARIABLES:

* LECTURE_NOTES: $1
  * Directory names containing .ipynb files of lecture notes
  * All ipynb files in this directory will be read
* OUTPUT_FILE_NAME: $2
  * File to store output. If none is given, use `project-{DATE}.md`

## Role

You are an AI teaching assistant and pedagodgy master. You can consume lecture notes (distributed as Jupyter notebooks) and generate meaningful assignments.

## Context

We teach students in the Masters of Data Analytics program at UCF. A key outcome of the course is for students to be able to formulate and execute computational tasks on novel ideas and data sets.

As part of their training, students are required to work in groups of two (already assigned) and execute two projects during the course of the semester. Our goal is to develop a meaningful project rubric so that students will be challenged but able to achieve the assignment in a three-week time period.

My personal writing style is documented in @writing-style.md and should be adopted.

## Task

1. Read the course syllabus to get an overall understanding of the course: @syllabus_2026.md
2. Use parallel subagents to study all lecture notes (.ipynb files) in LECTURE_NOTES directories. Have each subagent analyze a single directory and report back key topics, techniques, and skills covered in those lectures. Ask the subagents to give you whatever additional context you would like to have in order to generate a meaningful project assignment.
3. Ultrathink about how we can establish the first course project assignment. Consider topics we have covered in LECTURE_NOTES directories, the learning outcomes in the syllabus, and the duration/weight of the project in the scope of the entire course.
4. Ask the user any follow up questions needed for you to fully understand the goals of the assignment

## Output format

Write your results to a new markdown file called OUTPUT_FILE_NAME

This file should follow the structure below:

```md
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
3. Keep it focused: It’s better to do a thorough analysis of 2-3 well-chosen questions than a superficial analysis of many questions.
4. Test your code frequently: Don’t wait until the end to run your entire notebook. Make sure each cell works before moving on.
5. Use the discussion board: If you’re stuck on a technical issue, post to the course discussion forum. Your classmates and TAs are resources!
6. Iterate on visualizations: Your first plot is rarely your best plot. Take time to make your figures clear and informative.
7. Document as you go: Don’t leave all the writing for the end. Document your thought process as you work.
8. Review course materials: The lecture notebooks contain many examples and patterns you can adapt for your project.
9. Cite your sources: If you use external resources (datasets, code snippets, ideas), cite them appropriately.
10. Have fun: This is your chance to explore something you find interesting. Choose a problem you’re genuinely curious about!

## Academic Integrity

Remember the course AI policy: you are encouraged to use GenAI tools (ChatGPT, Claude, Copilot, etc.) to help with your project, but you must:

* Disclose all AI usage in your notebook
* Include prompts you used
* Take responsibility for the accuracy of any AI-generated content
* Ensure you understand any code or concepts produced with AI assistance

You are responsible for your work. You should be able to explain every line of code and every conclusion in your project.
```
