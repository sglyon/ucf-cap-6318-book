# Platforms Unit: Algorithm-to-Code Pass

Date: 2026-11-10
Scope: `week10/L10.01`, `week10/L10.02`, `week11/L11.01`, `week11/L11.02`. Game theory is plan-only (last section).

## Goal

Bring the platforms lectures in line with the networks-unit pattern:

1. describe the model
2. demonstrate the model
3. describe an algorithm (numbered steps or a named equation, own cell)
4. translate the algorithm to code

## Balance with the earlier course

Networks lectures have at most one student-coded core algorithm each:

| Lecture | Student-coded algorithm |
|---|---|
| L03.01 | `breadth_first_distances` (plus a `SimpleDiGraph` overload reusing the same test helper) |
| L03.02 | `local_bridges` |
| L04.02 | `traverse_graph` → `shortest_path` |
| L04.01, L04.03 | none |

The platforms unit matches this: **one student stub per lecture**. Existing extension exercises
(`adoption_with_frictions`, `better_platform_loss_rate`, `proposer_advantage_experiment`, L10.01 Ex.4–5,
L11.01 Ex.2–3, L11.02 Ex.4–6) stay unchanged.

## Stub conventions (from L03.01 / L04.02)

- Markdown algorithm cell with numbered steps immediately before the stub.
- Stub cell: signature, docstring stating the return shape, body of `# TODO` / `# CHANGE ME` lines, returns `nothing`.
- Separate test cell: `test_<name>(...)` with hand-checked expected values, wrapped in `run_tests()`.
- Separate cell: `# uncomment the code below and run when you are ready to test your code` / `# run_tests()`.
- Solutions are never filled in. The notebook must run top to bottom with the stub unsolved.
- Leaf rule: the stubbed function must have no downstream caller. Relaxed only for A3 (below).

## Student stubs

| # | Lecture | Section | Function | Status |
|---|---|---|---|---|
| A3 | L10.02 | Build 3 "A Threshold Rule" | `my_threshold_adoption` | worked code → stub + reference |
| A4 | L11.01 | Build 3 "Detour: Newton's Method" | `newton_path` | worked code → stub |
| A7 | L11.02 | Build 2 "Exercise 2: Hospitals Have Capacity" | `deferred_acceptance_capacities` | existing stub gains algorithm cell + tests |
| A10 | L10.01 | "Let Expectations Update" | `adoption_path` | worked code → stub (taught next offering) |

### A3. Threshold cascade (L10.02 Build 3) — leaf rule relaxed

`threshold_adoption` is called by the seeding comparison (cell 53) and Exercise 4, so it cannot be a bare stub.
Pattern mirrors BFS → Graphs.jl: students write `my_threshold_adoption`; the lecture then shows the reference
`threshold_adoption` (current code, unchanged) and uses it downstream.

- Algorithm cell (after the existing equation in "A Threshold Rule"):
  1. Mark the seeds adopted; record the adoption rate.
  2. For every non-adopter, compute the share of its neighbors that adopted **last round**.
  3. Every node at or above $\tau$ adopts this round (synchronous update).
  4. If nobody new adopted, stop; else record the rate and return to step 2.
- Return: `Vector{Float64}` of adoption rates, one per round, starting at round 0.
- Test network: the toy network in `threshold_cascade.svg`, nodes A B C D F G H I (1–8), edges
  A-B, A-C, B-C, C-D, D-F, F-G, G-H, G-I, H-I; seeds A, B.
  - $\tau=0.5$ → `[0.25, 0.375, 0.5, 0.625]` (C, D, F adopt in turn; G-H-I stalls, matching the figure caption).
  - $\tau=0.7$ → `[0.25]` (C sees 2/3 < 0.7; nothing moves).
- Follow-up cell: "Our reference version" — current `threshold_adoption`, plus one line asserting it passes the same tests.

### A4. Scalar Newton's method (L11.01 Build 3)

`newton_path` is used only in its own demo; `newton_system` is independent. Leaf.

- Algorithm cell (after the existing update equation):
  1. Start with a guess $x_0$; record it.
  2. Evaluate $f(x_k)$ and $f'(x_k)$.
  3. Set $x_{k+1}=x_k-f(x_k)/f'(x_k)$; record it.
  4. Repeat steps 2–3 for the requested number of steps.
- Return: `Vector{Float64}` of length `steps + 1`.
- Tests:
  - `x^2 - 2`, start `1.0`, `steps=3` → `[1.0, 1.5, 1.4166666666666667, 1.4142156862745099]`.
  - Linear `x - 3`, start `0.0`, `steps=2` → `[0.0, 3.0, 3.0]` (one step for a line).
- The √2 error table moves below the tests into a cell guarded on `nothing`, so the notebook runs unsolved;
  the "From One Equation to Two" text that cites the error column is reworded to state the
  convergence result without depending on the student's output.

### A7. Deferred acceptance with capacities (L11.02 Build 2)

Already an exercise stub with no algorithm cell or tests. Leaf.

- Algorithm cell:
  1. Every doctor starts unmatched with a pointer at their first choice.
  2. Take an unmatched doctor who still has hospitals left; they propose to the next hospital on their list.
  3. The hospital adds the doctor to its held set.
  4. If the held set exceeds capacity $q_h$, the hospital rejects its least-preferred held doctor, who becomes unmatched.
  5. Repeat steps 2–4 until no unmatched doctor has a hospital left to propose to.
- Return: `Vector{Int}`, one hospital per doctor, `0` if unmatched.
- Tests:
  - Capacities `[1, 1, 1]` on the tiny market reproduce `deferred_acceptance(doctor_prefs, hospital_rank)`.
  - One rectangular case (more doctors than seats) with a hand-traced expected matching, including a `0`.
  - Expected values are traced by hand and confirmed against a throwaway solution during implementation.

### A10. Expectation dynamics (L10.01) — next offering

`adoption_path` feeds only the trajectory plot directly below it. The plot cell becomes guarded
(`paths === nothing` → skip with a message) so the notebook runs unsolved. Leaf in effect.

- Algorithm cell (after the existing $n_{t+1}=g(n_t;p)$ equation):
  1. Set $n_0$ to the starting expectation.
  2. Compute realized adoption $n_{t+1}=g(n_t)$.
  3. Use it as next period's expectation.
  4. Repeat for the requested number of periods.
- Return: `Vector{Float64}` of length `periods + 1`.
- Test: `g(n) = 0.5n + 0.1`, `n0 = 0.0`, `periods = 3` → `[0.0, 0.1, 0.15, 0.175]`.

## Numbered-steps cells before worked code (core only)

Markdown-only; code unchanged.

| # | Lecture | Algorithm | Current state | Change |
|---|---|---|---|---|
| A11 | L10.02 Build 2 | Pólya urn, `reinforced_adoption` | probability formula only | add 4-step loop description |
| A13 | L11.01 Build 3 | multivariate Newton, `newton_system` | equation + prose | restate as numbered steps (residual, stop test, Jacobian, linear solve, update) |
| A14 | L11.02 Build 2 | deferred acceptance | numbered steps already present | none |
| A17 | L11.02 Bridge | ascending-price auction | bullet steps | convert to numbered steps |
| A20 | L10.01 | fixed-point grid scan, `fixed_points` | code comment only | add steps: grid, sign changes, bisection refine, deduplicate |

## Rollout order

1. L10.02 (A3, A11) — Build 3 not yet taught this term.
2. L11.01 (A4, A13).
3. L11.02 (A7, A17).
4. L10.01 (A10, A20) — already taught; for next offering.

One commit per lecture.

## Verification

- Each changed notebook executes top to bottom with stubs unsolved (Julia kernel, `jupyter nbconvert --execute`).
- Each test harness is proven against a throwaway solution (not committed): tests pass with the solution, fail with the stub.
- `uv run myst build --html` succeeds; `make glossary-links` passes if new terms are added.
- Writing-style rules: no "actual"/"actually", no "Reveal" headings.

## Game theory (plan only, separate pass)

Same balance: at most one student stub per lecture; numbered-steps cells before library calls.

| Lecture | Candidate stub | Notes |
|---|---|---|
| L08.01 | `find_pure_nash` by best-response enumeration, then compare with `pure_nash` | IDDS is the alternative; both are leaf. Once taught here, L10.02 Build 1 refers back to it. |
| L08.02 | route-switching iteration to the Wardrop split, reused for Braess | replaces the blank "Numerical Verification" markdown cell |
| L09.01 | 2×2 mixed-equilibrium indifference solver | L09.04 Ex.1.2 depends on this skill; backward induction is the alternative |
| L09.03 | second-price vs first-price Monte Carlo | notebook has no code today |
| L09.04 | none new | add an algorithm cell before each existing TODO (Ex.1.2, 2.1, 2.2, 2.4 GSP) |
| L09.02 | none | not in the TOC |
