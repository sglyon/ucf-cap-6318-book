build:
	myst build --execute --html
	rsync -az --delete --info=progress2 ./_build/html/ ./docs/
