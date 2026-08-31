# Week 2 Julia Software Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace production Week 2 with two 50-minute Julia software-design lectures and an offline, independently executable guided package lab built around one Markov-model case study.

**Architecture:** Author directly in the authoritative cloned Jupyteach v2 tree. One tested Markov implementation supplies the examples for types and dispatch; a thin module file supplies the namespace lesson; the lab constructs an isolated stdlib-only package and runs its real test suite. Preserve all stable production identities and stop at the rendered Jupyteach plan until its exact operations are approved.

**Tech Stack:** Jupyteach CLI 0.3.9, Jupyteach course format v2, Julia 1.11.6, Julia standard libraries `Random`, `LinearAlgebra`, `Test`, Jupyter nbformat 4.5, Python 3 standard-library JSON tooling.

**Spec:** `docs/superpowers/specs/2026-08-31-week-2-julia-software-design.md`

## Global Constraints

- Production tree: `/home/sglyon/Teaching/UCF/CAP-6318/ucf-cap-6318-prod-review`.
- Course: `ucf-cap-6318`; baseline server revision: `5`.
- Week 2 directory remains `lectures/julia-2`.
- Julia remains `1.11`; do not change `environments/julia/Project.toml` or `Manifest.toml`.
- Preserve every existing lecture/content ULID, retained stable label, ordering, scheduling field, kernelspec, and notebook metadata.
- Each notebook must execute from a fresh kernel without prior notebook state.
- No executable cell may require network access or mutate the locked course environment.
- Lab package dependencies are limited to `Random`, `LinearAlgebra`, and `Test`.
- Keep notebook document structure semantic: one H1, H2 major sections, H3 subsections.
- Delete `Test Markdown` only through the reviewed course-tree plan.
- Never run `jupyteach apply` before explicit approval of the exact final plan.

## File Structure

- `lectures/julia-2/markov.jl`: Markov model types, validation, deterministic simulation, and stationary distribution.
- `lectures/julia-2/MarkovModels.jl`: module boundary, imports, exports, and inclusion of `markov.jl`.
- `lectures/julia-2/L02.01_julia_types_methods.ipynb`: 50-minute types/interfaces/dispatch lecture and executable contract checks.
- `lectures/julia-2/L02.02_code_organization.ipynb`: 50-minute source/module/package-structure lecture and namespace checks.
- `lectures/julia-2/L02.03_julia_packages.ipynb`: isolated guided lab that builds and tests a stdlib-only `MarkovModels` package.
- `lectures/julia-2/lecture.yml`: retained identities, improved titles/descriptions, renamed support file, and removal of temporary Markdown.
- `lectures/julia-2/module.jl`: removed after its content entry points to `MarkovModels.jl`.
- `lectures/julia-2/test-markdown.md`: removed with its temporary content entry.

---

### Task 1: Establish the Markov Model Contract

**Files:**
- Modify: `lectures/julia-2/L02.01_julia_types_methods.ipynb`
- Modify: `lectures/julia-2/markov.jl`

**Interfaces:**
- Consumes: Julia `Random.AbstractRNG`, `LinearAlgebra.eigen`, `AbstractMatrix{<:Real}`, and `AbstractVector`.
- Produces: `MarkovChain`, `transition_matrix`, `initial_distribution`, `state_values`, `simulate_indices`, `simulate`, and `stationary_distribution`.

- [ ] **Step 1: Initialize a local snapshot and confirm the untouched baseline**

Run in the production clone:

```bash
git init
git add .gitignore course.yml syllabus.md environments lectures
git commit -m "Snapshot ucf-cap-6318 revision 5"
jupyteach --output json status
```

Expected status fields: `valid: true`, empty `local.added`, `local.changed`, and `local.removed`; reachable server revision `5` matching `last_synced_revision`.

- [ ] **Step 2: Replace Lecture 1 cells with the failing behavioral contract first**

Retain notebook-level metadata, kernelspec `julia-1.11`, nbformat `4`, nbformat_minor `5`, and existing cell IDs where cells have a direct semantic successor. The final code-check cells must assert this contract before `markov.jl` is changed:

```julia
using Test, Random, LinearAlgebra
include("markov.jl")

P = [0.85 0.15; 0.25 0.75]
mc = MarkovChain(P, [1.0, 0.0], [:inactive, :active])

@test transition_matrix(mc) == P
@test initial_distribution(mc) == [1.0, 0.0]
@test state_values(mc) == [:inactive, :active]
@test simulate(MersenneTwister(42), mc, 8) ==
      simulate(MersenneTwister(42), mc, 8)
@test length(simulate_indices(MersenneTwister(7), mc, 12)) == 12
@test sum(stationary_distribution(mc)) ≈ 1.0
@test_throws ArgumentError MarkovChain([0.8 0.3; 0.2 0.8], [1.0, 0.0], [:a, :b])
@test_throws ArgumentError MarkovChain(P, [0.8, 0.1], [:a, :b])
```

The prose sequence is: learning outcomes; values/bindings/types; hierarchy; abstract/concrete/parametric types; the Markov model; behavioral interfaces; dispatch specificity; one ambiguity example and its resolution; deterministic RNG; synthesis checks.

- [ ] **Step 3: Execute Lecture 1 to verify the contract fails**

Run:

```bash
JULIA_PROJECT="$PWD/environments/julia" jupyter nbconvert --execute --to notebook --inplace lectures/julia-2/L02.01_julia_types_methods.ipynb --ExecutePreprocessor.kernel_name=julia-1.11 --ExecutePreprocessor.timeout=300
```

Expected: execution fails because the existing `markov.jl` does not provide the new validated model and public interface.

- [ ] **Step 4: Implement the minimal Markov model**

Write `markov.jl` with these concrete behaviors:

```julia
struct MarkovChain{T}
    transition::Matrix{Float64}
    initial::Vector{Float64}
    states::Vector{T}
    cumulative::Matrix{Float64}
end

function MarkovChain(
    transition::AbstractMatrix{<:Real},
    initial::AbstractVector{<:Real},
    states::AbstractVector{T},
) where {T}
    P = Matrix{Float64}(transition)
    p0 = Vector{Float64}(initial)
    values = collect(states)
    n = size(P, 1)

    size(P, 2) == n || throw(ArgumentError("transition matrix must be square"))
    length(p0) == n || throw(ArgumentError("initial distribution length must match the number of states"))
    length(values) == n || throw(ArgumentError("state-values length must match the number of states"))
    all(isfinite, P) && all(P .>= 0) || throw(ArgumentError("transition probabilities must be finite and nonnegative"))
    all(isfinite, p0) && all(p0 .>= 0) || throw(ArgumentError("initial probabilities must be finite and nonnegative"))
    all(isapprox.(vec(sum(P; dims=2)), 1.0; atol=1e-10, rtol=0)) ||
        throw(ArgumentError("each transition row must sum to one"))
    isapprox(sum(p0), 1.0; atol=1e-10, rtol=0) ||
        throw(ArgumentError("initial probabilities must sum to one"))

    cumulative = cumsum(P; dims=2)
    cumulative[:, end] .= 1.0
    return MarkovChain{T}(P, p0, values, cumulative)
end

transition_matrix(mc::MarkovChain) = copy(mc.transition)
initial_distribution(mc::MarkovChain) = copy(mc.initial)
state_values(mc::MarkovChain) = copy(mc.states)

function draw_index(rng::AbstractRNG, cumulative::AbstractVector{<:Real})
    return searchsortedfirst(cumulative, rand(rng))
end

function simulate_indices(rng::AbstractRNG, mc::MarkovChain, steps::Integer)
    steps >= 1 || throw(ArgumentError("steps must be at least one"))
    indices = Vector{Int}(undef, steps)
    indices[1] = draw_index(rng, cumsum(mc.initial))
    for t in 2:steps
        indices[t] = draw_index(rng, @view mc.cumulative[indices[t - 1], :])
    end
    return indices
end

simulate(rng::AbstractRNG, mc::MarkovChain, steps::Integer) =
    mc.states[simulate_indices(rng, mc, steps)]

function stationary_distribution(mc::MarkovChain)
    decomposition = eigen(transpose(mc.transition))
    index = argmin(abs.(decomposition.values .- 1))
    weights = abs.(real(decomposition.vectors[:, index]))
    return weights ./ sum(weights)
end
```


- [ ] **Step 5: Execute Lecture 1 and verify the contract passes**

Run the same `nbconvert` command from Step 3.

Expected: exit `0`; every `@test` passes; rendered outputs show deterministic equal seeded simulations and a normalized stationary distribution.

- [ ] **Step 6: Commit the independently executable Lecture 1**

```bash
git add lectures/julia-2/L02.01_julia_types_methods.ipynb lectures/julia-2/markov.jl
git commit -m "Rewrite Week 2 types and dispatch lecture"
```

### Task 2: Teach Module and Package Boundaries

**Files:**
- Create: `lectures/julia-2/MarkovModels.jl`
- Modify: `lectures/julia-2/L02.02_code_organization.ipynb`

**Interfaces:**
- Consumes: Task 1's exact public functions and `markov.jl` definitions.
- Produces: module `MarkovModels`, exporting `MarkovChain`, `transition_matrix`, `initial_distribution`, `state_values`, `simulate_indices`, `simulate`, and `stationary_distribution`.

- [ ] **Step 1: Write Lecture 2 namespace checks before finalizing the module**

End the notebook with executable checks:

```julia
using Test
include("MarkovModels.jl")

@test isdefined(Main, :MarkovModels)
@test isdefined(MarkovModels, :MarkovChain)
@test !isdefined(Main, :MarkovChain)

using .MarkovModels
@test isdefined(Main, :MarkovChain)
@test MarkovModels.MarkovChain === MarkovChain
```

A separate demonstration must show safe extension without committing type piracy:

```julia
struct LabeledChain{M}
    label::String
    model::M
end

label(chain::LabeledChain) = chain.label
```

Explain that extending `Random.rand` for `MarkovChain` would be safe because the course owns `MarkovChain`, while defining a new method on two foreign types is piracy.

- [ ] **Step 2: Run Lecture 2 and confirm the old module does not satisfy the new contract**

```bash
JULIA_PROJECT="$PWD/environments/julia" jupyter nbconvert --execute --to notebook --inplace lectures/julia-2/L02.02_code_organization.ipynb --ExecutePreprocessor.kernel_name=julia-1.11 --ExecutePreprocessor.timeout=300
```

Expected: failure because `MarkovModels.jl` does not exist.

- [ ] **Step 3: Write the final module wrapper**

`MarkovModels.jl` must be:

```julia
module MarkovModels

using LinearAlgebra
using Random: AbstractRNG, rand

export MarkovChain,
    initial_distribution,
    simulate,
    simulate_indices,
    state_values,
    stationary_distribution,
    transition_matrix

include("markov.jl")

end
```

Leave `module.jl` untouched until Task 4 changes its production content entry. Lecture prose follows: source files; exact `include` semantics; namespaces; module wrapper; qualification and exports; `using` versus `import`; safe extension and piracy; package directory anatomy; environment ownership; handoff to lab.

- [ ] **Step 4: Execute Lecture 2 from a fresh kernel**

Run the Step 2 command.

Expected: exit `0`; before `using .MarkovModels`, exported names are absent from `Main`; afterward the exported `MarkovChain` is identical to `MarkovModels.MarkovChain`.

- [ ] **Step 5: Commit the module lesson**

```bash
git add lectures/julia-2/L02.02_code_organization.ipynb lectures/julia-2/MarkovModels.jl
git commit -m "Teach Julia module and package boundaries"
```

### Task 3: Build the Offline Guided Package Lab

**Files:**
- Modify: `lectures/julia-2/L02.03_julia_packages.ipynb`

**Interfaces:**
- Consumes: Julia `Pkg`, `Random`, `LinearAlgebra`, and `Test`; Task 1's Markov behavior.
- Produces: a fresh package directory with `Project.toml`, `src/MarkovModels.jl`, `src/markov.jl`, and `test/runtests.jl`; a passing `Pkg.test` result; restored original active project.

- [ ] **Step 1: Write the lab acceptance cell first**

The final lab section must test the actual generated package:

```julia
original_project = Base.active_project()
try
    Pkg.activate(package_root)
    Pkg.instantiate()
    Pkg.test(; coverage=false)
finally
    if original_project === nothing
        Pkg.activate()
    else
        Pkg.activate(dirname(original_project))
    end
end

@test Base.active_project() == original_project
```

The generated `test/runtests.jl` must cover:

```julia
using MarkovModels
using Random
using Test

@testset "MarkovModels" begin
    P = [0.85 0.15; 0.25 0.75]
    mc = MarkovChain(P, [1.0, 0.0], [:inactive, :active])
    @test simulate(MersenneTwister(42), mc, 20) ==
          simulate(MersenneTwister(42), mc, 20)
    @test length(simulate_indices(MersenneTwister(7), mc, 12)) == 12
    @test sum(stationary_distribution(mc)) ≈ 1.0
    @test_throws ArgumentError MarkovChain([0.8 0.3; 0.2 0.8], [1.0, 0.0], [:a, :b])
    @test_throws ArgumentError MarkovChain(P, [0.8, 0.1], [:a, :b])
    @test_throws ArgumentError simulate(MersenneTwister(1), mc, 0)
end
```

- [ ] **Step 2: Execute the incomplete lab to verify the package test fails**

```bash
JULIA_PROJECT="$PWD/environments/julia" jupyter nbconvert --execute --to notebook --inplace lectures/julia-2/L02.03_julia_packages.ipynb --ExecutePreprocessor.kernel_name=julia-1.11 --ExecutePreprocessor.timeout=600
```

Expected: failure because the package files have not yet been created.

- [ ] **Step 3: Implement the guided package construction**

The notebook must create `lab_root = mktempdir()` and `package_root = joinpath(lab_root, "MarkovModels")`, then create `src` and `test`. It writes a complete package using visible code cells and explains every file before writing it.

Use this `Project.toml` shape with a fixed teaching-package UUID:

```toml
name = "MarkovModels"
uuid = "9f9a0f5b-5a74-4b41-9e4e-6d5d4b2d8f31"
version = "0.1.0"

[deps]
LinearAlgebra = "37e2e46d-f89d-539d-b4ee-838fcccc9c8e"
Random = "9a3f8284-a2c9-5f02-9a11-845980a1fd5c"

[extras]
Test = "8dfed614-e22c-5e08-85e1-65c5234f0b40"

[targets]
test = ["Test"]

[compat]
julia = "1.11"
```

Reuse the independently tested sibling sources without relying on prior notebook execution:

```julia
source_dir = joinpath(package_root, "src")
test_dir = joinpath(package_root, "test")
mkpath(source_dir)
mkpath(test_dir)

write(
    joinpath(source_dir, "MarkovModels.jl"),
    read("MarkovModels.jl", String),
)
write(
    joinpath(source_dir, "markov.jl"),
    read("markov.jl", String),
)
```

The notebook must display and explain both source files before copying them, then write the exact test suite from Step 1. Do not add registry packages. Do not call `Pkg.add`, `Pkg.rm`, a shell command, or an external executable.

The lab sequence is: package anatomy; isolated workspace; project metadata; `src` module; model implementation; tests; activate/instantiate/test; inspect generated manifest; restore course environment; reflection and Week 3 bridge.

- [ ] **Step 4: Execute the complete lab twice**

Run the Step 2 command twice.

Expected for both runs: exit `0`; a new temporary package is created; `Pkg.test` passes; the active project equals its pre-lab value at the end; no registry or package download appears in output.

- [ ] **Step 5: Commit the guided lab**

```bash
git add lectures/julia-2/L02.03_julia_packages.ipynb
git commit -m "Add offline MarkovModels guided lab"
```

### Task 4: Map the Redesign into Jupyteach Metadata

**Files:**
- Modify: `lectures/julia-2/lecture.yml`
- Remove: `lectures/julia-2/test-markdown.md`
- Remove: `lectures/julia-2/module.jl`

**Interfaces:**
- Consumes: retained production IDs and labels from revision 5.
- Produces: unchanged content ordering for the five retained blocks, updated titles/descriptions/files, and no temporary Markdown block.

- [ ] **Step 1: Lock the expected manifest contract before editing**

Record these invariants from the baseline:

```text
lecture id: 01M0TD9JC7XYXGRMPP6WCJ0BH1
notebook ids: 01M0TD9JCBP95H8WG4Z2GSQ0GZ, 01M0TD9JCCQQP85T474JDVAC5Z, 01M0TD9JCE0N9ZYEX1E052FBEG
support ids: 01M0TD9JCEJ20GVA9YSF9V0BR2, 01M0TD9JCEBR9DCZ0VV6WT1JXZ
deleted temporary id: 01M176M8RXZGV7WYZ3A6MX617Y
```

Run `jupyteach validate`; expected baseline result is success.

- [ ] **Step 2: Update retained metadata and remove the temporary block**

Set lecture title to `Julia Software Design` and description to `Design reusable Julia software with types, multiple dispatch, modules, isolated environments, and tests.`

Use these content titles and descriptions in the existing order:

```text
Types, Interfaces, and Multiple Dispatch
Model state and behavior with Julia's type system, validated constructors, dispatch, and reproducible simulation.

From Notebook Code to a Julia Package
Organize the Markov model with source files, modules, explicit namespaces, package structure, and environment boundaries.

Guided Lab: Build and Test MarkovModels
Compose Week 2 concepts into an isolated, stdlib-only Julia package and verify it with Pkg.test.

Markov model implementation
Supporting Julia source for the Week 2 Markov model.

MarkovModels module
Supporting module wrapper used by the Week 2 lectures.
```

For support content ID `01M0TD9JCEBR9DCZ0VV6WT1JXZ`, change `file` to `MarkovModels.jl` and title to `MarkovModels module`; preserve label `module`. Remove the temporary Markdown entry and delete `test-markdown.md`.

- [ ] **Step 3: Validate identity, ordering, and file references**

```bash
jupyteach --output json validate
```

Expected stdout: `[]`; expected exit code: `0`; no warnings on stderr. Confirm all retained IDs and labels exactly match Step 1 and every `file` exists as a sibling.

- [ ] **Step 4: Commit the metadata cutover**

```bash
git add lectures/julia-2/lecture.yml lectures/julia-2/MarkovModels.jl lectures/julia-2/module.jl lectures/julia-2/test-markdown.md
git commit -m "Map Week 2 redesign into Jupyteach"
```

### Task 5: Verify the Complete Local Course Tree

**Files:**
- Verify: `lectures/julia-2/*.ipynb`
- Verify: `lectures/julia-2/*.jl`
- Verify: `lectures/julia-2/lecture.yml`
- Verify: `course.yml`

**Interfaces:**
- Consumes: Tasks 1–4 as one local tree.
- Produces: three successfully executed notebooks, valid course tree, and exact read-only production plan.

- [ ] **Step 1: Execute all three notebooks from fresh kernels**

Run each separately with `JULIA_PROJECT="$PWD/environments/julia"`, kernel `julia-1.11`, and the timeouts from prior tasks.

Expected: all exit `0`; Lecture 1 checks pass; Lecture 2 namespace checks pass; the lab's real `Pkg.test` passes and restores the original project.

- [ ] **Step 2: Inspect notebook execution results**

For each notebook, parse JSON and assert:

```python
assert nb["metadata"]["kernelspec"]["name"] == "julia-1.11"
assert nb["nbformat"] == 4
assert nb["nbformat_minor"] == 5
assert not any(
    output.get("output_type") == "error"
    for cell in nb["cells"] if cell["cell_type"] == "code"
    for output in cell.get("outputs", [])
)
```

Also assert exactly one Markdown line begins with `# ` in each notebook and that it is the first semantic heading.

- [ ] **Step 3: Run the authoritative offline validator**

```bash
jupyteach validate
```

Expected: validation success with no errors or warnings.


- [ ] **Step 4: Commit regenerated notebook outputs**

```bash
git add lectures/julia-2/L02.01_julia_types_methods.ipynb lectures/julia-2/L02.02_code_organization.ipynb lectures/julia-2/L02.03_julia_packages.ipynb
git commit -m "Record verified Week 2 notebook outputs"
```

### Task 6: Present the Exact Production Plan

**Files:**
- Read-only plan over the complete production clone.

**Interfaces:**
- Consumes: validated tree from Task 5.
- Produces: rendered and JSON plans with identical operation sets and warnings, plus a human approval gate.

- [ ] **Step 1: Confirm the server has not advanced**

```bash
jupyteach --output json status
```

Expected: server reachable and still matching the clone's last-synced revision. If it advanced, preserve local commits, pull, rebase the Week 2 changes onto the canonical tree, rerun Tasks 5 and 6, and obtain approval for the new plan.

- [ ] **Step 2: Render both human and machine-readable plans**

```bash
jupyteach plan
jupyteach --output json plan
```

Expected: only Week 2 updates, the `module.jl` to `MarkovModels.jl` support-file change, and deletion of temporary content ID `01M176M8RXZGV7WYZ3A6MX617Y`; zero warnings. Treat the actual output as authoritative rather than this expectation.

- [ ] **Step 3: Present every operation and warning**

List operations in CLI order, summarize counts by create/update/move/delete, and explicitly label every delete. Include base revision and tree SHA. Stop before apply.

- [ ] **Step 4: Obtain explicit approval of that exact plan**

Approval must cover every rendered operation and warning. A changed tree, changed server revision, or regenerated plan invalidates the approval.

### Task 7: Apply and Verify Canonical Production State

**Files:**
- Production state managed by Jupyteach CLI.

**Interfaces:**
- Consumes: exact approved plan from Task 6.
- Produces: updated production Week 2, canonical pulled tree, zero local drift, and zero-operation follow-up plan.

- [ ] **Step 1: Record the approved local tree**

```bash
git status --short
git log -5 --oneline
```

Expected: no uncommitted course-tree changes and the Task 1–5 commits present.

- [ ] **Step 2: Apply without force**

```bash
jupyteach apply
```

Expected: every approved operation succeeds. Do not use `--force`; any warning or revision conflict returns to Task 6.

- [ ] **Step 3: Pull and verify canonical state**

```bash
jupyteach pull
jupyteach --output json status
jupyteach plan
```

Expected: zero local added/changed/removed files; server revision matches `last_synced_revision`; plan reports `0 operation(s)` and `Local tree already matches the server.`

- [ ] **Step 4: Smoke-test the actual production surface**

Open the Week 2 lecture in `https://app.jupyteach.com/app/course/ucf-cap-6318`. Confirm the new lecture title, five retained ordered blocks, absence of Test Markdown, semantic section navigation, notebook rendering, and executable guided-lab flow. Confirm no browser console error caused by the changed content.

- [ ] **Step 5: Record the canonical post-apply tree**

If `jupyteach pull` rewrites canonical YAML or notebook JSON, commit only those canonical changes:

```bash
git add course.yml lectures/julia-2
git commit -m "Record canonical Week 2 production state"
```
