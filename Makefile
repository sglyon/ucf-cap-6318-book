# LLM API keys are read at run time from the 1Password item below, so no key is
# ever stored in this repo.
#
# Auth: if OP_TOKEN_FILE exists it is sourced to pick up a service account token
# (headless, works over SSH). Otherwise `op` falls back to your logged-in
# session, which needs `eval $(op signin)` first. A vault is always passed
# explicitly because service accounts require one.
OP_ITEM ?= UCF-CAP-6318
OP_VAULT ?= UCF
OP_TOKEN_FILE ?= $(HOME)/.config/op/cap6318.env
OP_AUTH = if [ -f "$(OP_TOKEN_FILE)" ]; then set -a; . "$(OP_TOKEN_FILE)"; set +a; fi
OP_GET = op item get $(OP_ITEM) --vault $(OP_VAULT) --reveal --fields

# Notebooks that make live LLM API calls and therefore need injected keys.
LLM_NOTEBOOKS ?= weekA01/*.ipynb

.PHONY: build run op-check execute-llm

build:
	uv run myst build --html
	rsync -az --delete --info=progress2 ./_build/html/ ./docs/
	echo "ucf-cap-6318.spencerlyon.com" > ./docs/CNAME
	touch ./docs/.nojekyll

run:
	uv run myst build --html --execute --strict

# Confirm both keys resolve, without printing their values.
op-check:
	@$(OP_AUTH); \
	test -n "$$($(OP_GET) label=OPENAI_API_KEY)" \
		|| { echo "OPENAI_API_KEY unresolved from 1Password item '$(OP_ITEM)'"; exit 1; }; \
	test -n "$$($(OP_GET) label=ANTHROPIC_API_KEY)" \
		|| { echo "ANTHROPIC_API_KEY unresolved from 1Password item '$(OP_ITEM)'"; exit 1; }; \
	echo "op: both keys resolved from '$(OP_ITEM)'"

# Execute the LLM lectures with keys injected from 1Password, then rebuild.
execute-llm: op-check
	@$(OP_AUTH); \
	export OPENAI_API_KEY="$$($(OP_GET) label=OPENAI_API_KEY)"; \
	export ANTHROPIC_API_KEY="$$($(OP_GET) label=ANTHROPIC_API_KEY)"; \
	for f in $(LLM_NOTEBOOKS); do \
		echo "executing $$f"; \
		uv run jupyter nbconvert --to notebook --execute --inplace \
			--ExecutePreprocessor.timeout=900 "$$f" || exit 1; \
	done
	$(MAKE) build
