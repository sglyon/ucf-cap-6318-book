build:
	BASE_URL="https://ucf-cap-6318.spencerlyon.com" myst build --html --execute
	rsync -az --delete --info=progress2 ./_build/html/ ./docs/
