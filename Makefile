build:
	uv run python scripts/sync_diagram_attachments.py
	uv run myst build --html
	rsync -az --delete --info=progress2 ./_build/html/ ./docs/

run:
	uv run python scripts/sync_diagram_attachments.py
	uv run myst build --html --execute --strict

.PHONY: project-handout
project-handout:
	python3 scripts/build_project_handout.py -o _build/handouts/project-2026.html
