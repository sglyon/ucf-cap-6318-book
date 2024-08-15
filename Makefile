build:
	myst build --html --execute
	rsync -az --delete --info=progress2 ./_build/html/ ./docs/
	echo "ucf-cap-6318.spencerlyon.com" > ./docs/CNAME
	touch ./docs/.nojekyll
