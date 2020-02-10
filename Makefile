NODE_VERSION ?= 12
NODE_IMAGE := node:$(NODE_VERSION)
DOCKER_RUN := docker run -v "$${PWD}:/app" -w /app
NPM ?= $(DOCKER_RUN) $(NODE_IMAGE) npm

.PHONY: test
test:
		$(NPM) test

.PHONY: build
build:
		$(NPM) run build

.PHONY: lint
lint:
		$(NPM) run lint

.PHONY: lint-fix
lint-fix:
		$(NPM) run lint:fix

.PHONY: verify
verify:
		$(NPM) run verify

.PHONY: run-in-node
run-in-node:
		$(DOCKER_RUN) -it $(NODE_IMAGE) /bin/bash
