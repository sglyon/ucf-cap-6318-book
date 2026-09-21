build:
	uv run myst build --html
	rsync -az --delete --info=progress2 ./_build/html/ ./docs/

run:
	uv run myst build --html --execute --strict
