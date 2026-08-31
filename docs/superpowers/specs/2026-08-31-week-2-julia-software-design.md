# Week 2 Julia Software Design

## Purpose

Modernize Week 2 of production course `ucf-cap-6318` into two 50-minute lectures and one independent guided lab. The sequence teaches Julia software design through one cumulative Markov-model case study while remaining reproducible on Jupyteach's locked, device-local Julia 1.11 environment.

## Current production baseline

The authoritative production tree was cloned at server revision 5. It is valid, reachable, and has zero local drift. Week 2 is `lectures/julia-2`, titled `Julia 2`, with three notebook content blocks, two supporting Julia files, and one temporary Markdown block.

Existing lecture and content ULIDs, stable labels, ordering, scheduling, notebook metadata, and valid outputs remain unchanged. The `lectures/julia-2` directory remains stable.

## Instructional architecture

### Lecture 1: Types, Interfaces, and Multiple Dispatch

Target: 50 minutes.

The lecture follows define → explain → demonstrate:

1. Define Julia's type model accurately: values have types; bindings name values; types organize representation and behavior.
2. Explain abstract, concrete, and parametric types using a small `MarkovChain` model.
3. Demonstrate constructors that validate transition matrices and initial distributions.
4. Define behavioral interfaces and explain why callers should use methods rather than depend on fields.
5. Explain multiple dispatch, fallback methods, specificity, and method ambiguity.
6. Demonstrate reproducible simulation by accepting an `AbstractRNG` rather than depending on global RNG state.
7. End with short executable checks and a working Markov simulation.

The implementation uses concrete or parametric field types where they aid specialization. It does not teach indiscriminate argument annotations or concrete-only APIs. Methods accept useful abstractions such as `AbstractMatrix`, `AbstractVector`, and `AbstractRNG`, while stored fields have stable concrete representations.

### Lecture 2: From Notebook Code to a Julia Package

Target: 50 minutes.

The lecture continues the same model:

1. Move the implementation from notebook cells into `.jl` source files.
2. Define `include` precisely as evaluation in a module's global scope; distinguish it from package loading.
3. Explain modules, qualified names, `export`, `using`, and `import`.
4. Demonstrate safe method extension and explicitly identify type piracy.
5. Introduce the conventional package structure: `Project.toml`, `src/MarkovModels.jl`, implementation files, and `test/runtests.jl`.
6. Explain project environments, compatibility bounds, manifests, activation, instantiation, and `Pkg.test`.
7. Contrast the locked Jupyteach course environment with an isolated student package workspace.

The lecture does not call `Pkg.add` or `Pkg.rm` against the active course environment. It does not depend on registry access, external executables, or persistent state created by Lecture 1.

### Guided lab: Build and Test MarkovModels

The third notebook becomes an independent guided lab. Students:

1. Create an isolated, rerunnable package workspace.
2. Build a standard package layout.
3. Implement validated constructors, deterministic simulation, and stationary-distribution behavior.
4. Add tests for normal behavior, invalid transition matrices, invalid initial distributions, seeded reproducibility, and public API boundaries.
5. Run `Pkg.test` and interpret the result.
6. Reflect on how package interfaces prepare the model for Week 3 graph structures.

The package depends only on Julia standard libraries already present in the installed toolchain: `Random`, `LinearAlgebra`, and `Test`. `Pkg.instantiate` and `Pkg.test` therefore remain offline-capable and must not resolve registry packages.

The lab is rerunnable. It creates a new isolated workspace for each run, restores the original active project after package operations, and does not mutate the course's locked `Project.toml` or `Manifest.toml`.

## Jupyteach production mapping

### Lecture metadata

- Retitle `Julia 2` to `Julia Software Design`.
- Add a concise lecture description covering types, dispatch, modules, environments, and testing.
- Add concise descriptions to all retained content blocks.
- Preserve the lecture ULID, content ULIDs, labels, order, schedule, and environment resolution.

### Notebook content

- Rewrite `L02.01_julia_types_methods.ipynb` as Lecture 1.
- Rewrite `L02.02_code_organization.ipynb` as Lecture 2.
- Rewrite `L02.03_julia_packages.ipynb` as the guided lab while preserving its content identity and stable label.
- Replace Fall 2025 references with term-neutral course identification so the content does not become stale each year.
- Use one semantic H1 for notebook identity, H2 for major sections, and deeper headings only for real subsections.
- Keep every notebook independently executable from a fresh kernel.
- Preserve notebook metadata and retain outputs only when they still correspond to the rewritten code.

### Supporting files

- Modernize `markov.jl` to match the taught implementation.
- Replace the generic `module.jl` artifact with clearly named MarkovModels module source while preserving the existing content-block ULID and stable label.
- Keep supporting source files as sibling files because Jupyteach v2 content references cannot contain `/`.

### Removal

Delete the `Test Markdown` content block and `test-markdown.md`. Its production description explicitly identifies it as temporary and says it will be deleted. This deletion must appear in the reviewed Jupyteach plan before apply.

## Platform invariants

1. The production course is edited only through its cloned Jupyteach v2 tree.
2. Existing IDs and stable labels never change.
3. Lecture directory and scheduling fields remain unchanged.
4. No notebook mutates the locked course environment.
5. No executable path requires network access.
6. No notebook depends on prior notebook execution.
7. Notebook outputs, execution counts, kernelspec, and metadata are preserved or regenerated deliberately rather than stripped.
8. The production apply occurs only after review and explicit approval of the exact `jupyteach plan`.

## Verification

### Content execution

Execute each rewritten notebook against the resolved Julia 1.11 course environment from a fresh kernel. Confirm:

- Lecture 1's validation and seeded simulation examples pass.
- Lecture 2 loads and uses the module without namespace conflicts.
- The guided lab creates the package, runs `Pkg.test`, restores the prior active project, and requires no network access.
- No cell has an unexpected error.

### Tree and production gates

1. Run `jupyteach validate` and fix every reported path.
2. Run `jupyteach plan` and present every operation and warning, explicitly calling out the Test Markdown deletion and any file rename.
3. Stop until the exact plan is approved.
4. Record the approved tree in source control or a separate snapshot.
5. Run `jupyteach apply` without `--force` unless every warning is separately approved.
6. Run `jupyteach pull`, `jupyteach status`, and `jupyteach plan`.
7. Require zero local drift, matching server revision, zero operations, and `Local tree already matches the server.`

## Non-goals

- Changing the course's Julia version or locked environment dependencies.
- Changing Week 1 or Week 3 content.
- Creating a graded assignment or altering gradebook visibility.
- Introducing external Julia packages into the lab.
- Preserving obsolete examples merely to minimize textual diff.
