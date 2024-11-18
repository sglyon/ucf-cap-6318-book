# CAP-6318 Book

This project contains the source code for the book used in teaching CAP-6318 Computational Analysis of Social Complexity at UCF in Fall 2024.

To build the book run `make build`.

The project's repo is set up to use GitHub pages and host the site contained in the `docs` directory of the main branch.

The `build` Makefile rule will automatically copy the built output into this directory.

The Makefile rule does not execute the notebooks. We assume that the notebooks are already executed and contents are saved within.
