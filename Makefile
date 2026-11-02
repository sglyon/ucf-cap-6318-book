build:
	uv run python scripts/sync_diagram_attachments.py
	uv run python scripts/glossary.py render
	uv run python scripts/glossary.py check
	uv run myst build --html
	rsync -az --delete --info=progress2 ./_build/html/ ./docs/

run:
	uv run python scripts/sync_diagram_attachments.py
	uv run python scripts/glossary.py render
	uv run python scripts/glossary.py check
	uv run myst build --html --execute --strict

.PHONY: glossary-links
glossary-links:
	uv run python scripts/glossary.py link --apply
	uv run python scripts/glossary.py check

.PHONY: project-handout
project-handout:
	python3 scripts/build_project_handout.py -o _build/handouts/project-2026.html

.PHONY: auctions
auctions:
	node week09/auction-room/server.js

.PHONY: platforms
platforms:
	node week10/platform-room/server.js
