# CAP-6318 Book

This project contains the source code for the book used in teaching CAP-6318 Computational Analysis of Social Complexity at UCF. All course material is in Python (numpy, pandas, networkx, quantecon, mesa, matplotlib).

Set up the environment with [uv](https://docs.astral.sh/uv/): `uv sync --all-groups`.

To build the book run `make build`.

The project's repo is set up to use GitHub pages and host the site contained in the `docs` directory of the main branch.

The `build` Makefile rule will automatically copy the built output into this directory.

The Makefile rule does not execute the notebooks. We assume that the notebooks are already executed and contents are saved within.

**Known gap:** the weekA01 notebooks were converted from Julia with empty outputs and
need one live execution to restore stored results (the Julia edition shipped with
outputs). With `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` exported and funded, run:

```bash
for f in weekA01/*.ipynb; do
  uv run jupyter nbconvert --to notebook --execute --inplace "$f"
done
make build
```
