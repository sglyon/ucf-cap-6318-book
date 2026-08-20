# CAP-6318 Book

This project contains the source code for the book used in teaching CAP-6318 Computational Analysis of Social Complexity at UCF. All course material is in Python (numpy, pandas, networkx, quantecon, mesa, matplotlib).

Set up the environment with [uv](https://docs.astral.sh/uv/): `uv sync --all-groups`.

To build the book run `make build`.

The project's repo is set up to use GitHub pages and host the site contained in the `docs` directory of the main branch.

The `build` Makefile rule will automatically copy the built output into this directory.

The Makefile rule does not execute the notebooks. We assume that the notebooks are already executed and contents are saved within.

## Executing the LLM lectures

The `weekA01` lectures make live API calls. Their keys live in the 1Password item
`UCF-CAP-6318` (vault `UCF`) and are injected at run time -- no key is ever stored
in this repo:

```bash
make op-check      # verify both keys resolve, without printing them
make execute-llm   # execute weekA01 notebooks in place, then rebuild the site
```

Authentication is either a 1Password service account token in
`~/.config/op/cap6318.env` (headless, works over SSH) or your own interactive
session via `eval $(op signin)`. Override the scope with
`make execute-llm LLM_NOTEBOOKS="weekA01/*.ipynb weekA02/*.ipynb"`.
