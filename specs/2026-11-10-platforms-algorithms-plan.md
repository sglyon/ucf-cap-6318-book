# Platforms Algorithm-to-Code Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one student-coded algorithm stub per platforms lecture (A3, A4, A7, A10) and numbered-steps cells before four worked algorithms (A11, A13, A17, A20).

**Architecture:** Edit the four existing Julia notebooks in place. Each stub follows the L03.01 BFS pattern: algorithm cell → exercise cell → stub → test-harness cell (`test_<name>`, `run_tests()`) → commented `# run_tests()` cell. Notebooks must run top to bottom with stubs unsolved.

**Tech Stack:** Julia 1.13 notebooks (kernel `julia-1.13`, repo `Project.toml`), Graphs.jl, MyST (`uv run myst build`), nbconvert for execution checks.

**Spec:** `specs/2026-11-10-platforms-algorithms-design.md`

## Global Constraints

- One student stub per lecture; never fill in a solution in a committed notebook.
- Stub cells return `nothing` and mark work with `# TODO` / `# CHANGE ME`, like `traverse_graph` in `week04/L04.02_weighted_graphs.ipynb`.
- Test cells print `correct!` on success and `error(...)` with expected vs. got on failure.
- The `run_tests()` call lives alone in a cell: `# uncomment the code below and run when you are ready to test your code` / `# run_tests()`.
- Writing style (`writing-style.md`): never "actual"/"actually"; no "Reveal" headings; bullet-heavy, first-person plural.
- Do not hand-write `{term}` roles; run `make glossary-links` instead.
- Do not execute notebooks in place (keeps stored outputs and diffs small). Execute copies into `/tmp`.
- Do not run `make build` or touch `docs/` (that deploys the site).

## Notebook editing mechanics (all tasks)

- Use the `edit` tool on the notebook. `read` shows cells as `# %% [markdown] cell:N` / `# %% [code] cell:N`.
- Insert a new cell by adding a bare `# %% [markdown]` or `# %% [code]` marker line followed by its body.
- Replace a cell body by replacing the lines under its marker. Re-read after every edit; indices shift.
- The `edit` tool writes cells without an `id` and drops the trailing newline. After the task's edits, normalize once (the same serializer the repo scripts use, `scripts/sync_diagram_attachments.py:61`):

```bash
python3 - <<'EOF' NOTEBOOK_PATH
import json, sys, uuid
p = sys.argv[1]
nb = json.load(open(p))
for c in nb["cells"]:
    c.setdefault("id", uuid.uuid4().hex[:8])
open(p, "w").write(json.dumps(nb, indent=1, ensure_ascii=False) + "\n")
EOF
```

- Check: `python3 -c "import json,sys; t=open(sys.argv[1]).read(); assert json.dumps(json.loads(t),indent=1,ensure_ascii=False)+'\n'==t; assert all('id' in c for c in json.loads(t)['cells']); print('ok')" NOTEBOOK_PATH`

## Verification commands (all tasks)

- Unsolved run: `uv run jupyter nbconvert --to notebook --execute --ExecutePreprocessor.kernel_name=julia-1.13 --ExecutePreprocessor.timeout=900 --output-dir /tmp/platforms-verify NOTEBOOK_PATH` → must write the output file with no `CellExecutionError`.
- Harness proof (throwaway, never committed): copy the notebook to `/tmp/platforms-solved/`, replace the stub body with a working solution in that copy only, uncomment `run_tests()`, execute it with the same nbconvert command, and confirm the run_tests cell output contains `correct!`. Then confirm that in the unsolved `/tmp/platforms-verify` copy, running `run_tests()` would fail: execute a second unsolved copy with `run_tests()` uncommented and `--allow-errors`, and confirm the cell output shows the harness `error` message.

---

### Task 1: L10.02 — threshold cascade stub (A3) and Pólya urn steps (A11)

**Files:**
- Modify: `week10/L10.02_ignition_and_tipping.ipynb` (cells 24, 49–50, 61, 63 by current index)

**Interfaces:**
- Consumes: `using Graphs` (cell 1); existing `threshold_adoption(g, seeds, tau; max_steps = 40)` (cell 50), unchanged.
- Produces: `my_threshold_adoption(g, seeds, tau; max_steps = 40)` stub; `test_threshold_adoption(f)` and `run_tests()`.

- [ ] **Step 1: A11 — append the urn algorithm to cell 24 ("### A Reinforced Adoption Rule")**

Append after the last bullet (`- We use $\gamma=2$: ...`):

```markdown
- Algorithm for $T$ new adopters:
  1. Start with installed bases $n_A$ and $n_B$; record A's share
  2. Compute the weights $n_A^\gamma$ and $n_B^\gamma$
  3. Draw a uniform random number; if it is below $n_A^\gamma/(n_A^\gamma+n_B^\gamma)$ the adopter joins A, otherwise B
  4. Add one to the chosen platform's base and record A's share
  5. Repeat steps 2-4 until $T$ adopters have arrived
```

- [ ] **Step 2: A3 — insert the algorithm cell after cell 49 (caption ending "...none of them ever reaches τ.")**

New markdown cell:

```markdown
- Let's turn the threshold rule into an algorithm
- Inputs: a graph $g$, a set of seeds, and a threshold $\tau$
  1. Mark the seeds adopted and record the adoption rate
  2. For every node that has not adopted, compute the share of its neighbors that had adopted **last round**
  3. Every node whose share is at least $\tau$ adopts this round
  4. If nobody new adopted, stop. Otherwise record the new adoption rate and return to step 2
- Adoption is irreversible, so the adopted set only grows and the loop must stop
- Compare with breadth-first search in [](../week03/L03.01_graphs.ipynb): both spread outward from a starting set one round at a time
- The difference: BFS reaches a node as soon as one neighbor is reached; a cascade needs a **share** of neighbors
```

- [ ] **Step 3: Insert the exercise cell right after it**

```markdown
### Exercise 3: Code the Cascade

- Fill in `my_threshold_adoption` below, following steps 1-4
- Return a `Vector{Float64}` of adoption rates: element 1 is round 0 (seeds only), plus one element for each round in which someone new adopts
- The tests use the toy network from [the cascade figure](#fig-threshold-cascade), with nodes A, B, C, D, F, G, H, I numbered 1-8 and seeds A and B
- Before running them, predict the adoption rates for $\tau=0.5$ by hand from the figure
```

- [ ] **Step 4: Insert the stub cell**

```julia
"""
Run the threshold cascade on graph `g` from `seeds` with threshold `tau`.
Return a `Vector{Float64}` of adoption rates: element 1 is round 0 (seeds only),
plus one element for each round in which someone new adopts.
"""
function my_threshold_adoption(g, seeds, tau; max_steps = 40)
    adopted = falses(nv(g))
    # TODO: step 1 -- mark the seeds adopted and record the adoption rate
    adoption_rate = Float64[]  # CHANGE ME

    for _ in 1:max_steps
        next_adopted = copy(adopted)
        # TODO: step 2 -- for each non-adopter v, compute the share of neighbors(g, v) adopted last round
        # TODO: step 3 -- if that share is at least tau, set next_adopted[v] = true
        # TODO: step 4 -- stop if nobody new adopted; otherwise update `adopted` and record the rate
    end

    return nothing  # CHANGE ME
end
```

- [ ] **Step 5: Insert the test cell**

```julia
# test code
function test_threshold_adoption(f)
    toy = SimpleGraph(8)  # A B C D F G H I
    for (i, j) in [(1, 2), (1, 3), (2, 3), (3, 4), (4, 5), (5, 6), (6, 7), (6, 8), (7, 8)]
        add_edge!(toy, i, j)
    end
    same(got, want) = got !== nothing && length(got) == length(want) && all(isapprox.(got, want))

    got = f(toy, [1, 2], 0.5)
    want = [0.25, 0.375, 0.5, 0.625]
    same(got, want) || error("tau = 0.5: expected $want, got $got")

    got = f(toy, [1, 2], 0.7)
    same(got, [0.25]) || error("tau = 0.7: C sees 2/3 < 0.7, so nothing should move; got $got")

    println("correct!")
end

function run_tests()
    test_threshold_adoption(my_threshold_adoption)
end
```

Hand check for $\tau=0.5$: round 1 C adopts (2/3), round 2 D (1/2), round 3 F (1/2), round 4 nobody (G sees 1/3) → rates 2/8, 3/8, 4/8, 5/8.

- [ ] **Step 6: Insert the uncomment cell**

```julia
# uncomment the code below and run when you are ready to test your code
# run_tests()
```

- [ ] **Step 7: Insert the reference-version markdown cell immediately before the existing `function threshold_adoption` cell**

```markdown
- Here is our version of the same algorithm, `threshold_adoption`
- The rest of the lecture uses it, so the comparisons below run whether or not your version is finished
- Once yours passes `run_tests()`, swap it into the next experiment and confirm the curves match
```

- [ ] **Step 8: Insert a code cell immediately after the existing `threshold_adoption` cell**

```julia
test_threshold_adoption(threshold_adoption)
```

- [ ] **Step 9: Renumber later exercises**

- `### Exercise 3: Give the Better Platform an Edge` → `### Exercise 4: Give the Better Platform an Edge`
- `### Exercise 4: Where Do Cascades Die?` → `### Exercise 5: Where Do Cascades Die?`

- [ ] **Step 10: Normalize, then verify**

Run the normalize and JSON-style check commands on `week10/L10.02_ignition_and_tipping.ipynb`.
Unsolved run: must succeed, and the Step 8 cell output must be `correct!` (this proves the harness against the reference).
Harness proof: the solved copy uses the body of `threshold_adoption` inside `my_threshold_adoption` → `correct!`; the unsolved copy with `run_tests()` uncommented → `tau = 0.5: expected [0.25, 0.375, 0.5, 0.625], got nothing`.

- [ ] **Step 11: Glossary and commit**

```bash
make glossary-links
git add week10/L10.02_ignition_and_tipping.ipynb glossary.md
git commit -m "L10.02: students code the threshold cascade; add Pólya urn algorithm steps"
```

---

### Task 2: L11.01 — scalar Newton stub (A4) and multivariate Newton steps (A13)

**Files:**
- Modify: `week11/L11.01_platform_pricing.ipynb` (cells 22, 23, 24, 53, 54, 56, 58 by current index)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `newton_path(f, fprime, x; steps=5)` stub; `test_newton_path(f)`, `run_tests()`; `root2_gap`, `root2_slope` unchanged.

- [ ] **Step 1: A4 — append the algorithm to cell 22 ("### Detour: Newton's Method")**

Append after `- Try it on $f(x)=x^2-2$, whose root is $\sqrt{2}$`:

```markdown
- Algorithm:
  1. Start with a guess $x_0$ and record it
  2. Evaluate $f(x_k)$ and $f'(x_k)$
  3. Set $x_{k+1}=x_k-f(x_k)/f'(x_k)$ and record it
  4. Repeat steps 2-3 for the requested number of steps
```

- [ ] **Step 2: Replace cell 23 with an exercise cell, stub, tests, uncomment cell, and demo**

New markdown cell (before the code):

```markdown
### Exercise 1: Code Newton's Method

- Fill in `newton_path` below, following steps 1-4
- Return a `Vector{Float64}` of length `steps + 1`: the starting guess followed by each new iterate
- Predict by hand: starting from $x_0=1$ on $x^2-2$, what is $x_1$?
- A second test uses a straight line: how many steps should Newton's method need there?
```

Stub (replaces the old cell 23 body):

```julia
root2_gap(x) = x^2 - 2
root2_slope(x) = 2x

"""
Take `steps` Newton steps on `f` (with derivative `fprime`) from the guess `x`.
Return a `Vector{Float64}` of length `steps + 1`: the starting guess followed by each new iterate.
"""
function newton_path(f, fprime, x; steps=5)
    path = Float64[]  # CHANGE ME: start the path with the initial guess
    for _ in 1:steps
        # TODO: steps 2-3 -- evaluate f and fprime at x, take the Newton step, record the new x
    end
    return nothing  # CHANGE ME
end
```

Test cell:

```julia
# test code
function test_newton_path(f)
    same(got, want) = got !== nothing && length(got) == length(want) &&
        all(isapprox.(got, want; atol=1e-12))

    got = f(root2_gap, root2_slope, 1.0; steps=3)
    want = [1.0, 1.5, 1.4166666666666667, 1.4142156862745099]
    same(got, want) || error("x^2 - 2 from 1.0: expected $want, got $got")

    got = f(x -> x - 3, x -> 1.0, 0.0; steps=2)
    same(got, [0.0, 3.0, 3.0]) || error("x - 3 from 0.0: expected [0.0, 3.0, 3.0], got $got")

    println("correct!")
end

function run_tests()
    test_newton_path(newton_path)
end
```

Uncomment cell:

```julia
# uncomment the code below and run when you are ready to test your code
# run_tests()
```

Markdown cell:

```markdown
- Once your tests pass, run the next cell to watch the error shrink
```

Demo cell:

```julia
guesses = newton_path(root2_gap, root2_slope, 1.0)
if guesses === nothing
    println("Finish `newton_path` above, then rerun this cell")
else
    [0:5 guesses abs.(guesses .- sqrt(2))]
end
```

- [ ] **Step 3: Edit cell 24 ("### From One Equation to Two")**

Replace the first bullet:

`- The error column drops from about $10^{-1}$ to $10^{-12}$ in four steps; bisection would need about 40 halvings`

with:

`- With a working `newton_path`, the error falls from about $10^{-1}$ to $10^{-12}$ in four steps; bisection would need about 40 halvings`

Replace the last bullet (`- `newton_system` below is exactly this loop, stopping once $\lVert F(x)\rVert$ is tiny`) with (A13):

```markdown
- `newton_system` below runs these steps:
  1. Start at a guess $x_0$
  2. Evaluate the residual $F(x_k)$. If its largest entry is below the tolerance, stop and return $x_k$
  3. Compute the Jacobian $J(x_k)$
  4. Solve $J(x_k)\Delta=F(x_k)$ for the step $\Delta$
  5. Set $x_{k+1}=x_k-\Delta$ and return to step 2
  6. If the iteration limit passes first, report that Newton's method did not converge
```

- [ ] **Step 4: Renumber later exercises**

- `### Exercise 1: Platform or Tariff?` → `### Exercise 2: Platform or Tariff?`
- `### Exercise 2: More Sellers` → `### Exercise 3: More Sellers`
- `### Exercise 3: Which Value Matters?` → `### Exercise 4: Which Value Matters?`
- `### Exercise 4: Design a Compute Marketplace` → `### Exercise 5: Design a Compute Marketplace`

- [ ] **Step 5: Normalize, then verify**

Normalize and check `week11/L11.01_platform_pricing.ipynb`.
Unsolved run: succeeds; the demo cell prints `Finish \`newton_path\` above, then rerun this cell`; later `newton_system` cells still print `Newton prices: [4.0, 4.0]`.
Harness proof: solved copy uses the pre-change body from `git show HEAD:week11/L11.01_platform_pricing.ipynb` cell 23 → `correct!`, and the demo cell shows the six-row error table; unsolved copy → `x^2 - 2 from 1.0: expected [...], got nothing`.

- [ ] **Step 6: Glossary and commit**

```bash
make glossary-links
git add week11/L11.01_platform_pricing.ipynb glossary.md
git commit -m "L11.01: students code scalar Newton; number the multivariate Newton steps"
```

---

### Task 3: L11.02 — capacity deferred acceptance harness (A7) and ascending-auction steps (A17)

**Files:**
- Modify: `week11/L11.02_matching_markets.ipynb` (cells 33, 34, 43 by current index)

**Interfaces:**
- Consumes: `doctor_prefs` (cell 16), `hospital_rank` (cell 17), `deferred_acceptance(proposer_prefs, receiver_rank)` (cell 19).
- Produces: `deferred_acceptance_capacities(proposer_prefs, receiver_rank, capacities)` stub (exists); new `test_capacities(f)`, `run_tests()`.

- [ ] **Step 1: A7 — insert the algorithm cell after cell 33 ("### Exercise 2: Hospitals Have Capacity")**

```markdown
- Algorithm (doctor-proposing; hospital $h$ holds at most $q_h$ doctors):
  1. Every doctor starts unmatched, pointing at their first choice
  2. Pick an unmatched doctor who still has hospitals left; they propose to the next hospital on their list
  3. The hospital adds the doctor to the set it holds
  4. If that set now exceeds $q_h$, the hospital rejects its least-preferred held doctor, who becomes unmatched
  5. Repeat steps 2-4 until no unmatched doctor has a hospital left to try
- Compared with `deferred_acceptance`: a hospital holds a **set** instead of one doctor, and a doctor can run out of hospitals
- Return one hospital per doctor, or `0` for a doctor left unmatched
- The tests check two markets: the tiny market with every capacity set to 1, and a four-doctor market with only three seats
```

- [ ] **Step 2: Add a docstring to the existing stub (cell 34); keep its TODOs**

```julia
"""
Doctor-proposing deferred acceptance where receiver `h` holds up to `capacities[h]` proposers.
`proposer_prefs[d, k]` is doctor `d`'s `k`th choice; `receiver_rank[h, d]` is `d`'s rank at `h` (1 = best).
Return a `Vector{Int}` with one receiver per proposer, or `0` if unmatched.
"""
function deferred_acceptance_capacities(proposer_prefs, receiver_rank, capacities)
    # TODO: track a collection of tentative matches at each receiver
    # TODO: reject the worst held proposer when capacity is exceeded
    # TODO: return one receiver (or 0 if unmatched) for each proposer
    return nothing
end
```

- [ ] **Step 3: Insert the test cell after the stub**

```julia
# test code
function test_capacities(f)
    got = f(doctor_prefs, hospital_rank, [1, 1, 1])
    want = deferred_acceptance(doctor_prefs, hospital_rank)
    got == want || error("Capacities [1, 1, 1] should match deferred_acceptance: expected $want, got $got")

    # Four doctors, two hospitals; H1 holds two doctors, H2 holds one
    prefs = [1 2;   # D1: H1 ≻ H2
             1 2;   # D2: H1 ≻ H2
             1 2;   # D3: H1 ≻ H2
             2 1]   # D4: H2 ≻ H1
    rank = [2 3 1 4;   # H1: D3 ≻ D1 ≻ D2 ≻ D4
            3 1 4 2]   # H2: D2 ≻ D4 ≻ D1 ≻ D3
    got = f(prefs, rank, [2, 1])
    got == [1, 2, 1, 0] || error("Capacity market: expected [1, 2, 1, 0], got $got")

    println("correct!")
end

function run_tests()
    test_capacities(deferred_acceptance_capacities)
end
```

Hand trace of the capacity market: D1→H1 {D1}; D2→H1 {D1,D2}; D3→H1 over capacity, rejects D2 → {D3,D1}; D4→H2 {D4}; D2→H2 over capacity, rejects D4 → {D2}; D4→H1 over capacity, rejects D4; D4 has no hospitals left → `[1, 2, 1, 0]`. Proposer-optimal, so proposal order does not change the result.

- [ ] **Step 4: Insert the uncomment cell**

```julia
# uncomment the code below and run when you are ready to test your code
# run_tests()
```

- [ ] **Step 5: A17 — rewrite cell 43 ("### An Ascending-Price Auction")**

Replace the first four bullets with:

```markdown
### An Ascending-Price Auction

- Algorithm (E&K §10.4):
  1. Set every price to zero
  2. Build the preferred-seller graph at the current prices
  3. If it has a perfect matching, stop: these prices clear the market
  4. Otherwise find a constricted set of buyers and raise the price of every seller in its neighborhood by one
  5. Subtract the minimum price from every price, then return to step 2
```

Keep the remaining bullets unchanged (`- Normalization preserves payoff rankings...`, `- [The diagram below](#fig-ascending-auction-rounds) ...`).

- [ ] **Step 6: Normalize, then verify**

Normalize and check `week11/L11.02_matching_markets.ipynb`.
Unsolved run: succeeds (cell downloads Airbnb data; needs network).
Harness proof: in the solved copy only, write a capacity version of `deferred_acceptance` from the Step 1 algorithm (hold a `Vector{Vector{Int}}` per hospital; on overflow drop the held doctor with the largest `receiver_rank`; a doctor whose `next_choice` passes `size(proposer_prefs, 2)` stays `0`). Do not paste that solution into this plan or any committed file. Solved → `correct!`; unsolved → `Capacities [1, 1, 1] should match deferred_acceptance: expected [2, 1, 3], got nothing`.

- [ ] **Step 7: Glossary and commit**

```bash
make glossary-links
git add week11/L11.02_matching_markets.ipynb glossary.md
git commit -m "L11.02: add algorithm and tests for capacity deferred acceptance; number auction steps"
```

---

### Task 4: L10.01 — expectation-dynamics stub (A10) and fixed-point scan steps (A20)

**Files:**
- Modify: `week10/L10.01_platform_economics.ipynb` (cells 25–26, 31, 32, 33, 43, 44, 46 by current index)

**Interfaces:**
- Consumes: `g` (cell 21), `n_L`, `n_H` (defined before cell 33).
- Produces: `adoption_path(n0, g; periods=25)` stub; `test_adoption_path(f)`, `run_tests()`; `paths` (`Matrix{Float64}` or `nothing`).

- [ ] **Step 1: A20 — insert a markdown cell between cell 25 (`bisect_zero`) and cell 26 (`fixed_points`)**

```markdown
- Bisection finds one root inside one bracket, but $g$ can have up to three fixed points
- To find them all, `fixed_points` below:
  1. Lays a fine grid on $[0,1]$ and computes the gap $h(n)=g(n)-n$ at every grid point
  2. Keeps any grid point where the gap is already zero
  3. Wherever the gap changes sign between neighboring points, a root lies between them: refine it with bisection
  4. Sorts the roots and drops near-duplicates
- The grid must be fine enough that no two fixed points share one grid cell
```

- [ ] **Step 2: A10 — append the algorithm to cell 31 ("## Let Expectations Update")**

Append after `- We will start on both sides of $n_L$ and let the feedback run`:

```markdown
- Algorithm:
  1. Set $n_0$ to the starting expectation
  2. Compute realized adoption $n_{t+1}=g(n_t)$
  3. Use it as next period's expectation
  4. Repeat steps 2-3 for the requested number of periods
```

- [ ] **Step 3: Replace cell 32 with an exercise cell, stub, tests, uncomment cell, and path cell**

Exercise markdown:

```markdown
### Exercise 3: Code the Expectation Dynamics

- Fill in `adoption_path` below, following steps 1-4
- Return a `Vector{Float64}` of length `periods + 1`, starting with `n0`
- The test uses the line $g(n)=0.5n+0.1$ from $n_0=0$: compute the first three updates by hand before running it
```

Stub:

```julia
"""
Iterate the expectation update n_{t+1} = g(n_t) for `periods` steps from `n0`.
Return a `Vector{Float64}` of length `periods + 1`, starting with `n0`.
"""
function adoption_path(n0, g; periods=25)
    path = zeros(periods + 1)
    # TODO: step 1 -- store the starting expectation in path[1]
    # TODO: steps 2-4 -- for t in 1:periods, set path[t + 1] from path[t]
    return nothing  # CHANGE ME
end
```

Test cell:

```julia
# test code
function test_adoption_path(f)
    line(n) = 0.5n + 0.1
    got = f(0.0, line; periods=3)
    want = [0.0, 0.1, 0.15, 0.175]
    got !== nothing && length(got) == length(want) && all(isapprox.(got, want)) ||
        error("g(n) = 0.5n + 0.1 from 0.0: expected $want, got $got")
    println("correct!")
end

function run_tests()
    test_adoption_path(adoption_path)
end
```

Uncomment cell:

```julia
# uncomment the code below and run when you are ready to test your code
# run_tests()
```

Path cell:

```julia
starting_points = [0.05, 0.12, 0.14, 0.50, 0.95]
paths = adoption_path(starting_points[1], g) === nothing ? nothing :
    hcat([adoption_path(n0, g) for n0 in starting_points]...)
```

- [ ] **Step 4: Guard the plot (cell 33)**

```julia
if paths === nothing
    println("Finish `adoption_path` above, then rerun this cell to see the trajectories")
else
    plot(
        0:25, paths;
        label=permutedims(["n₀ = $n0" for n0 in starting_points]),
        xlabel="Expectation-update step",
        ylabel="Adoption",
        ylims=(0, 1),
        title="A small difference around the threshold becomes a large one",
    )
    hline!([n_L n_H]; label=[L"unstable $n_L$" L"stable $n_H$"], linestyle=[:dot :dash], color=[:red :black])
end
```

- [ ] **Step 5: Renumber later exercises**

- `### Exercise 3: Classify Four Platforms` → `### Exercise 4: Classify Four Platforms`
- `### Exercise 4: A Different Network-Value Function` → `### Exercise 5: A Different Network-Value Function`
- `### Exercise 5: Subsidize Early Adopters` → `### Exercise 6: Subsidize Early Adopters`

- [ ] **Step 6: Normalize, then verify**

Normalize and check `week10/L10.01_platform_economics.ipynb`.
Unsolved run: succeeds; plot cell prints the "Finish `adoption_path`" message; `critical_mass` sweep still plots.
Harness proof: solved copy uses the pre-change body from `git show HEAD:week10/L10.01_platform_economics.ipynb` cell 32 → `correct!` and the trajectory plot renders; unsolved → `g(n) = 0.5n + 0.1 from 0.0: expected [...], got nothing`.

- [ ] **Step 7: Glossary and commit**

```bash
make glossary-links
git add week10/L10.01_platform_economics.ipynb glossary.md
git commit -m "L10.01: students code expectation dynamics; number the fixed-point scan steps"
```

---

### Task 5: Site build check

**Files:** none modified.

- [ ] **Step 1:** `uv run python scripts/glossary.py check` → exits 0.
- [ ] **Step 2:** `uv run myst build --html` → succeeds; L10.01, L10.02, L11.01, L11.02 pages build. Do not rsync to `docs/`.
- [ ] **Step 3:** Grep the four notebooks for banned words: `grep -nE "\b[Aa]ctual(ly)?\b|^#+ Reveal" ` on the extracted markdown → no hits in new text.
- [ ] **Step 4:** Remove `/tmp/platforms-verify` and `/tmp/platforms-solved`.
