build:
	BASE_URL="https://sglyon.github.io/ucf-cap-6318-book/docs" myst build --html --execute
	rsync -az --delete --info=progress2 ./_build/html/ ./docs/
