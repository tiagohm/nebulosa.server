.PHONY: dev lint format test compile serve

dev:
	bun --watch run .

lint:
	bun lint

format:
	bun format

test:
	bun test --timeout 10000

compile:
	bun build --compile --minify . --outfile nebulosa.exe

serve: compile
	./nebulosa.exe
