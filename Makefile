.PHONY: help dev build start test test-watch lint type-check clean

help:
	@echo "Targets: dev build start test test-watch lint type-check clean"

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

test:
	npm test

test-watch:
	npm run test:watch

lint:
	npm run lint

type-check:
	npm run type-check

clean:
	rm -rf .next coverage
