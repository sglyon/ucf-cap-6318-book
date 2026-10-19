# Course Project

> Computational Analysis of Social Complexity - CAP 6318
>
> Fall 2026, Spencer Lyon

**Assigned:** Monday, October 19 (after class 8)
**Final submission due:** Sunday, November 29, 11:59 PM ET
**Presentations and defense:** Monday, November 30 (class 14)
**Weight:** 30% of course grade
**Team size:** 2-3 students (assigned)

## Overview

So far in this course you have learned to represent social and economic systems as networks, and simulate them with agent-based models. Over the coming weeks you will add game theory, AI agents, and platform economics to that toolkit. This project asks you to use those tools to answer a question of your own choosing.

The project runs for six weeks, from week 8 through week 13. That is enough time to go *deep*: to pick one question you care about, answer it carefully, and then push further with robustness checks and extensions.

The project is also designed with AI in mind. You have access to tools that can write a working notebook, a tidy README, and a confident paragraph of interpretation in a few minutes. That's great news for your productivity. It also means a polished notebook, by itself, does not tell me much about what *you* understand.

So this project is designed around the parts of computational social science that AI does not do for you:

- Choosing a question worth asking
- Deciding which model or data can actually answer it
- Checking whether the numbers on your screen are right
- Explaining what a result means, what it doesn't mean, and why
- Telling a clear story that ends in a takeaway: what should someone do or believe after reading your report?

You are encouraged to use AI heavily for the rest. In exchange, the bar is high. Loading a dataset, computing some centralities, making a few plots, and providing interpretation/intuition is a starting point for this project, not a finished one.

## Learning Objectives

By completing this project, you will:

1. Formulate a focused, answerable question about a social or economic system
2. Select and justify a computational approach from the course (networks, ABMs, game theory, AI agents, platforms and markets)
3. Implement that approach in reproducible code
4. Verify your results against theory, baselines, or known cases
5. Communicate findings, uncertainty, and limitations with a clear narrative and conclusions a reader can act on
6. Defend your design choices and results in conversation

## Instructions

1. **Pick a question, not a dataset.** Start from something about how people, firms, or institutions interact that you find puzzling. Then ask which course tools could shed light on it. Strong questions are specific and could come out more than one way:
   - "Did the 2021 chip shortage propagate through the U.S. input-output network the way the production network model predicts?"
   - "In a Schelling-style model, does letting agents communicate with neighbors (via an LLM) speed up or slow down segregation?"
   - "Do LLM bidders in a first-price auction shade their bids the way Bayes-Nash equilibrium says they should?"
   - "How much of a ride-share platform's subsidy is needed to tip a two-sided market, and how sensitive is that to the cross-side network effect?"
   - "Do weak ties act as bridges between communities in a real collaboration network?"

2. **Go deep in one core course topic.** Your analysis must center on one of the course's main toolkits:
   - Networks (weeks 3-5): graph metrics, ties and homophily, structural balance, production networks
   - Agent-based models (weeks 6-7)
   - Game theory (weeks 8-9): Nash and mixed equilibria, network traffic, auctions
   - AI agents (weeks 10-11): LLM agents, tool use, multi-agent systems, evaluation
   - Platforms and marketplaces (weeks 12-13): network effects, tipping, pricing, matching

   Your project must go deep in one of these topics. We recommend bringing in a concept or technique from a second topic as well (e.g., an agent-based model on a real network, LLM agents playing a game). Avoid a shallow tour of several topics; it will score lower than a thorough treatment of one. Note that you will start the project before we cover AI agents and platforms; it is fine to propose a topic from those units, and you can refine it at the check-in.

3. **Ground your work in something real.** Do at least one of the following:
   - Analyze a real dataset
   - Calibrate a model's parameters to real data or published estimates
   - Compare a model's output to a known empirical pattern or theoretical prediction

   A purely hypothetical model with arbitrary parameters is not enough on its own.

4. **Define a minimum result and a stretch goal.** In your proposal, state the smallest result that would answer your question (your "minimum viable result") and what you'd do with extra time. Get the minimum working first. Most of the depth this project asks for comes from what you do *after* your first result: robustness checks, extensions, and explanations of surprises.

5. **Verify every headline claim.** AI tools make it easy to produce numbers that look right and aren't. For each main result, show at least one independent check. Examples:
   - Reproduce a known result or closed-form solution on a toy case before running the real one
   - Compare against a simple baseline (random graph, rule-based agent, theoretical equilibrium)
   - Vary seeds, parameters, or prompts and report how much the result moves
   - Write tests for the core functions (`@test` in Julia, `assert`/`pytest` in Python)
   - Hand-compute one case and confirm the code agrees

   If a check fails, that's not a disaster. Report it and explain what you learned. A well-documented failure beats an unverified success.

6. **Keep a decision log as you go.** Maintain a `DECISIONS.md` file in your repository. Add an entry whenever you make a choice that shapes the project: picking a dataset, dropping a research question, changing a model assumption, accepting or rejecting something an AI tool suggested. Each entry needs a date, the decision, the alternatives you considered, and why you chose what you did. Five to fifteen entries is typical. You do not need to submit full prompt transcripts.

7. **Use Git from day one.** Work in a shared GitHub repository (public or private; if private, add me as a collaborator). Commit regularly. Your commit history is part of how I see your process. If you are not comfortable using Git and GitHub, request office hours time with the instructional team early so we can get you set up.

8. **Hit the milestones.** The project has two checkpoints before the final submission. They exist to catch problems early, not to add paperwork. See [Milestones and Timeline](#milestones-and-timeline).

9. **Write for a reader who will act on your results.** Communication quality is a major part of this project, not an afterthought. Your report should read as a narrative, not a log of everything you computed. Every section should build toward your main takeaway, and your conclusion should answer: what should someone do, or believe differently, after reading this? A correct analysis with no clear takeaway is an incomplete project.

## Milestones and Timeline

| Date | Milestone | What you submit |
| --- | --- | --- |
| Mon Oct 19 | Project assigned | Teams announced |
| Sun Nov 1, 11:59 PM | **M1: Proposal** | 1-2 page proposal (see below) + repo link |
| Mon Nov 9 (class 11) | Office hours sign-up | 10-minute team meeting with me during weeks 10-11 (optional but strongly encouraged) |
| Sun Nov 15, 11:59 PM | **M2: Check-in** | Working pipeline, first result, 1-page status memo |
| Mon Nov 16 (class 12) | Check-in discussion | Each team gives a 3-minute in-class update |
| Sun Nov 29, 11:59 PM | **Final submission** | Everything listed in [Deliverables](#deliverables) |
| Mon Nov 30 (class 14) | **Presentation and defense** | 15-minute team talk + individual Q&A |

Thanksgiving is Thursday, November 26. Plan to have your analysis essentially done by the 22nd so the holiday week is for writing and polishing.

### M1: Proposal (due Nov 1)

One to two pages, written by your team (not drafted by AI and lightly edited; I'll ask you about it). Include:

1. Your research question, and why someone should care about the answer
2. The course method(s) you'll use and why they fit the question
3. Your data source or calibration target, with a link, and confirmation you have actually downloaded or accessed it
4. Your minimum viable result and your stretch goal
5. The biggest risk to the project and your fallback plan
6. A short team agreement: how you'll split work, how often you'll meet, how you'll handle disagreements

**Tip:** Give the proposal real time. It is only one or two pages, but it is where you make the decisions that shape the rest of the project. A team that has a specific question, data in hand, and a clear minimum result on November 1 will have a much easier time executing over the following four weeks than a team that is still deciding what to study.

### M2: Check-in (due Nov 15)

By this point your code should run end to end on real inputs, even if the results are rough. Submit:

1. A link to your repo at the current commit
2. One preliminary figure or table with a two-sentence interpretation
3. A one-page memo covering what works, what broke, how your plan has changed since the proposal, and what you will do in the remaining two weeks

## Deliverables

Submit the following via a single GitHub repository (link submitted to Webcourses), tagged `final` at the submitted commit:

1. **Analysis notebook** (`project.ipynb`), executed top to bottom, containing:
   - **Introduction:** your question, why it matters, and what's already known
   - **Methods:** your model or analysis approach, its key assumptions, and why you chose it over alternatives
   - **Verification:** the checks from Instruction 5, with results
   - **Results:** figures and tables with captions that say what the reader should notice
   - **Discussion:** what your results mean, what they don't show, how they connect to course concepts, and what you'd do next
   - **Conclusion:** your takeaway in a few sentences: what should a reader do or believe after reading your report, and how confident should they be?

2. **Source code** (`.jl` and/or `.py` files) holding your reusable functions, with docstrings and tests. Julia is the course language and is preferred for the core analysis; Python is fine for LLM-agent components (PydanticAI, etc.) or if your team agrees on it at the proposal stage.

3. **Environment files** (`Project.toml`/`Manifest.toml` or `pyproject.toml`/`uv.lock`) so I can reproduce your results. If you call an LLM API, cache the raw responses to disk and include them so your notebook can re-run without new API calls.

4. **Data**, or a `data/README.md` explaining exactly how to obtain it if it is larger than 10 MB

5. **`README.md`** with your team, a 2-3 sentence summary, how to run everything, and 3-5 key findings

6. **`DECISIONS.md`**: your decision log (Instruction 6)

7. **`AI_USE.md`**: a short statement (roughly one page) covering:
   - Which AI tools you used and for what (coding, debugging, writing, brainstorming, as part of your model, etc.)
   - At least two specific cases where an AI tool was wrong, misleading, or unhelpful, and how you caught it
   - Which parts of the project you consider most fully your own thinking

   You do not need to paste every prompt. Do include the prompts for any LLM used *as part of your model* (agent system prompts, etc.), since those are part of your methods.

8. **Presentation slides** (PDF), uploaded with your final submission

9. **Contribution statement**: each team member submits, individually on Webcourses, a few sentences on what they and each teammate contributed

## Presentation and Defense (Nov 30)

Each team gives a **15-minute presentation** followed by questions. Tell the story of your project: the question, the approach, the main result, how you know it's right, and what surprised you. End on your takeaway: what should the audience do with what you found?

After the talk, I will ask **each team member individually** one or two questions about the project. Expect questions like:

- "Why did you choose this model over X?"
- "Walk me through what this function does."
- "What happens to this result if we change parameter Y?"
- "Which entry in your decision log was the hardest call, and why?"
- "Where did the AI steer you wrong?"

Every team member should be able to answer questions about any part of the project, not only the part they wrote. This is the main reason the course AI policy works: use whatever tools help you, but you must own and understand everything you submit.

## Resources

- **Course materials:** every lecture notebook in the course is fair game. Especially useful patterns:
  - Network analysis: L03.01, L04.01, L05.01
  - ABMs with Agents.jl: L06.02, L07.01, L07.02
  - Game theory computation: L08.01, L09.01, L09.03, L09.04
  - LLM agents, tools, and evaluation: L.A1.03, L.A2.01, L.A2.02, L.A02.03
  - Platforms and matching: L11.01, L11.02, L12.01, L12.02
- **Julia packages:** `Graphs.jl`, `SimpleWeightedGraphs.jl`, `Agents.jl`, `GameTheory.jl`, `DataFrames.jl`, `CSV.jl`, `Plots.jl`/`PlotlyBase.jl`, `Test` (stdlib)
- **Python packages:** `pydantic-ai`, `networkx`, `pandas`, `pytest`
- **Datasets:**
  - [Stanford Large Network Dataset Collection (SNAP)](http://snap.stanford.edu/data/)
  - [Network Repository](https://networkrepository.com/)
  - [BEA input-output accounts](https://www.bea.gov/industry/input-output-accounts-data)
  - [OECD inter-country input-output tables](https://www.oecd.org/sti/ind/inter-country-input-output-tables.htm)
  - [Census](https://data.census.gov/) and other government data portals
  - Published replication packages from papers in your area (often the best source of clean, interesting data)
- **LLM APIs:** the department provides LLM API access at no cost to you. If your project uses LLM APIs, contact me to get access. See the AI Agents unit for setup. Use the cheapest model that works while developing, and cache responses.
- **Textbooks:** Easley and Kleinberg, *Networks, Crowds, and Markets*; Sargent and Stachurski, *Economic Networks*

## Grading Rubric

The project is worth 100 points (30% of your course grade).

| Component | Points | Graded |
| --- | --- | --- |
| M1: Proposal | 10 | Team |
| M2: Check-in | 10 | Team |
| Final submission | 50 | Team |
| Presentation | 10 | Team |
| Individual defense | 15 | Individual |
| Process (decision log, commits, contribution) | 5 | Individual |

### M1: Proposal (10 points)

- **Full credit:** a specific, answerable question; a method that fits it; data you have in hand; a realistic minimum result; a credible risk and fallback
- **Partial credit:** vague question, unclear data access, or a scope that clearly won't fit six weeks. You'll get feedback either way; the point is to fix this early.

### M2: Check-in (10 points)

- **Full credit:** code runs end to end on real inputs; a real (if rough) result; an honest memo with a concrete plan
- **Partial credit:** pipeline incomplete or results are placeholders; memo is vague about what's left

### Final Submission (50 points)

**Question and approach (10 points)**

- *Excellent (9-10):* question is specific and well-motivated; method choice is justified against alternatives; assumptions are stated and defended
- *Good (7-8):* reasonable question and method with some justification
- *Needs work (0-6):* question is vague or the method doesn't fit it

**Depth and correctness of analysis (10 points)**

- *Excellent (9-10):* goes clearly beyond a first result: robustness checks, extensions, or a careful investigation of a surprise; methods applied correctly and with insight
- *Good (7-8):* solid, correct analysis of the core question with some follow-up
- *Satisfactory (5-6):* correct but shallow; stops at the first result
- *Needs work (0-4):* errors in method or interpretation

**Verification (10 points)**

- *Excellent (9-10):* every headline claim has an independent check; tests cover core functions; failures or sensitivities are reported honestly
- *Good (7-8):* main results checked; some tests
- *Needs work (0-6):* results are asserted without checks

**Communication, narrative, and conclusions (15 points)**

- *Excellent (14-15):* the report tells a clear story that builds to a specific, well-supported takeaway; conclusions say what a reader should do or believe and are worded no more strongly than the evidence supports; figures with informative captions; discussion separates what the results show from what they don't; limitations are specific, not boilerplate
- *Good (11-13):* clear and organized with a takeaway, minor gaps
- *Satisfactory (8-10):* organized, but the takeaway is vague or overstated
- *Needs work (0-7):* hard to follow, results presented without interpretation, or no clear takeaway

**Reproducibility and code quality (5 points)**

- *Full credit:* I can clone the repo, instantiate the environment, and re-run the notebook (with cached API responses if applicable); code is organized into documented functions
- *Partial credit:* runs with manual fixes, or code is disorganized

### Presentation (10 points)

- Clear story within time; main result, its verification, and the takeaway come through; slides support rather than repeat the talk

### Individual Defense (15 points)

- *Excellent (14-15):* answers confidently about any part of the project, including parts a teammate built; explains why choices were made, not only what was done; can reason about "what if" questions on the spot
- *Good (11-13):* solid on own work, some hesitation on other parts
- *Satisfactory (8-10):* can describe what was done but struggles to explain why
- *Needs work (0-7):* cannot explain significant parts of the submitted work

### Process (5 points)

- Decision log has substantive, dated entries made over the course of the project (not written the night before); commit history shows sustained contribution; contribution statements are consistent across the team

## Tips for Success

1. **Start early:** Six weeks feels like a lot. It isn't, once you account for finding data, getting it into the right shape, two milestones, and Thanksgiving.
2. **Get to a first result fast:** Aim to have *something* running end to end within the first two weeks. Depth comes from iterating on a working pipeline, not from planning the perfect one.
3. **Use AI as a collaborator, not an oracle:** Ask it to explain, propose alternatives, write a first draft of a function, or critique your plan. Then check its work. If you can't tell whether its answer is right, that's a signal to slow down and learn the concept.
4. **Ask AI to attack your results:** "Here is my finding and my method. What are three ways this could be wrong?" is one of the most useful prompts you can write. Then go check.
5. **Write the decision log in the moment:** A two-line entry right after a decision takes thirty seconds. Reconstructing ten of them the night before the deadline is painful and obvious.
6. **Communicate with your team:** Meet regularly. Make sure everyone understands every part of the project; you'll each be asked about all of it.
7. **Keep it focused:** One question answered well beats three answered superficially.
8. **Iterate on figures:** Your first plot is rarely your best. Every figure should have a point; say what it is in the caption.
9. **Treat surprises as gifts:** If your result contradicts the theory, that's often the most interesting part of the project. Dig in before you "fix" it.
10. **Come to office hours:** Especially between the proposal and the check-in. Ten minutes of conversation can save a week of heading in the wrong direction.
11. **Have fun:** This is your chance to spend real time on something you find interesting. Choose a question you're genuinely curious about!

## Academic Integrity

The course AI policy applies: you are encouraged to use GenAI tools, and you must disclose how you used them (`AI_USE.md`). You are responsible for the accuracy of everything you submit, whoever or whatever wrote the first draft. "That's what the AI said" is not an explanation.

You should be able to explain every line of code and every conclusion in your project. The individual defense is where you show that.

Additionally:

- All team members should contribute substantially
- Cite any external code, datasets, papers, or ideas you use
- Do not share code with other teams
- Do not reuse code from previous course projects without attribution

---

**Questions?** Post to the course discussion forum or come to office hours. I'm looking forward to seeing what you build.
