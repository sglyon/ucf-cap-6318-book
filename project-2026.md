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

Use the course's tools—networks, agent-based models, game theory, AI agents, or platform economics—to answer a social or economic question of your own choosing. Over six weeks (weeks 8-13), investigate one question carefully, then push beyond your first result with robustness checks or extensions.

You are encouraged to use AI heavily. You remain responsible for choosing a worthwhile question, justifying your approach, verifying results, and explaining a clear takeaway. A polished notebook alone is not enough: your analysis must have depth, and every team member must understand and defend the work.

## Instructions

1. **Pick a question, not a dataset.** Start with something puzzling about how people, firms, or institutions interact. Strong questions are specific and could come out more than one way:
   - "Did the 2021 chip shortage propagate through the U.S. input-output network the way the production network model predicts?"
   - "In a Schelling-style model, does letting agents communicate with neighbors (via an LLM) speed up or slow down segregation?"
   - "How much of a ride-share platform's subsidy is needed to tip a two-sided market, and how sensitive is that to the cross-side network effect?"

2. **Go deep in one core course topic.** Center your analysis on one toolkit:
   - Networks (weeks 3-5): graph metrics, ties and homophily, structural balance, production networks
   - Agent-based models (weeks 6-7)
   - Game theory (weeks 8-9): Nash and mixed equilibria, network traffic, auctions
   - AI agents (weeks 10-11): LLM agents, tool use, multi-agent systems, evaluation
   - Platforms and marketplaces (weeks 12-13): network effects, tipping, pricing, matching

   A second topic is encouraged (e.g., an ABM on a real network), but depth matters more than breadth. You may propose topics from units we haven't covered yet and refine them at the check-in.

3. **Ground your work in evidence or theory.** Do at least one:
   - Analyze a real dataset
   - Calibrate model parameters to real data or published estimates
   - Compare model output to a known empirical pattern or theoretical prediction

   A hypothetical model with arbitrary parameters is not enough on its own.

4. **Define a minimum result and a stretch goal.** State the smallest result that would answer your question (your "minimum viable result") and what you'd do with extra time. Get the minimum working first, then add robustness checks, extensions, or explanations of surprises.

5. **Verify every headline claim.** For each main result, show at least one independent check: reproduce a known solution on a toy case, compare against a simple baseline, vary seeds/parameters/prompts, test core functions, or hand-compute a case. Report failed checks and explain what you learned.

6. **Keep a decision log as you go.** In `DECISIONS.md`, record choices that shape the project, including accepting or rejecting AI suggestions. Each entry needs a date, the decision, alternatives considered, and your reasoning. Five to fifteen entries is typical; full prompt transcripts are not required.

7. **Use Git from day one.** Work in a shared GitHub repository; if private, add me as a collaborator. Commit regularly so your history shows your process. Seek help early if you need a Git introduction.

8. **Write toward a takeaway.** Build a narrative that answers: what should someone do or believe differently after reading your report? A correct analysis without a clear takeaway is incomplete.

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

| Component | Points | Basis for grading |
| --- | ---: | --- |
| M1: Proposal | 10 | Focused question, appropriate method, confirmed data access, realistic minimum result, and credible fallback |
| M2: Check-in | 10 | Working pipeline, preliminary result, and an honest assessment with concrete next steps |
| Final submission | 50 | Criteria below |
| Presentation | 10 | Clear story within 15 minutes; effective slides explain the main result, verification, and takeaway |
| Individual defense | 15 | Explains choices and code across the project, including teammates' work, and reasons through "what if" questions |
| Process | 5 | Substantive, dated decision log kept throughout the project, sustained Git contributions, and consistent contribution statements |

The first four components are graded as a team; defense and process are graded individually.

| Final submission criterion | Points | Full-credit standard |
| --- | ---: | --- |
| Question and approach | 10 | Specific, motivated question; method justified against alternatives; assumptions stated and defended |
| Depth and correctness | 10 | Correct analysis beyond a first result through robustness checks, extensions, or investigation of surprises |
| Verification | 10 | Independent checks for every headline claim, tests of core functions, and honest reporting of failures or sensitivities |
| Communication and conclusions | 15 | Clear narrative, informative figures and captions, specific limitations, and a useful takeaway no stronger than the evidence supports |
| Reproducibility and code | 5 | Documented, organized functions and an environment that lets me clone the repo and re-run the notebook, including cached API responses |

Full credit requires meeting the listed standard. Partial credit reflects the extent and significance of missing, weak, or incorrect work. Correct analysis that stops at a first result earns reduced credit for depth.

## Tips for Success

1. **Reach a first result early.** Aim for an end-to-end pipeline within the first two weeks so you have time to investigate and refine it.
2. **Ask AI to challenge your results.** Try: "Here is my finding and method. What are three ways this could be wrong?" Then check.
3. **Investigate surprises.** If a result contradicts theory, understand why before you "fix" it.
4. **Use office hours.** Especially between the proposal and check-in: ten minutes of conversation can save a week of work.

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
