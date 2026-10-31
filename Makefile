# kanji1024 — run `make help` for targets. Needs only a JavaScript runtime;
# `serve` uses python3, `licenses` uses gh, `images` needs BROWSER (see tools/screenshots.mjs).

NODE    ?= node
PORT    ?= 8000
SITE    := _site
PUBLISH := index.html api assets src data images LICENSE LICENSE-CC-BY-4.0 SPEC.md

.PHONY: help test check data images serve site licenses clean

help:
	@grep -E '^[a-z]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-9s %s\n", $$1, $$2}'

test: ## run the test suite
	$(NODE) --test test/*.test.mjs

check: data test ## regenerate data and fail if it drifted from the committed copy
	@! git rev-parse --git-dir >/dev/null 2>&1 || git diff --exit-code --stat -- data test/vectors.json

data: ## regenerate data/alphabet.tsv and test/vectors.json
	$(NODE) tools/generate.mjs

images: ## redraw the diagram and retake the screenshots (BROWSER=/path/to/browser)
	$(NODE) tools/diagram.mjs
	$(NODE) tools/screenshots.mjs

serve: ## serve the workbench on 127.0.0.1 (PORT=8000)
	python3 -m http.server $(PORT) --bind 127.0.0.1

site: ## assemble the static site in _site/
	rm -rf $(SITE) && mkdir -p $(SITE)
	cp -R $(PUBLISH) $(SITE)/

licenses: ## fetch the licence texts verbatim
	gh api licenses/apache-2.0 --jq .body > LICENSE
	gh api licenses/cc-by-4.0 --jq .body > LICENSE-CC-BY-4.0

clean: ## remove build output
	rm -rf $(SITE)
