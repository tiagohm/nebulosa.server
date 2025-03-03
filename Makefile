.PHONY: run lint format test compile serve

run:
	bun run .

lint:
	bun lint

format:
	bun format

test:
	bun test --timeout 10000

ifeq ($(OS),Windows_NT)
compile:
	bun build --compile --minify --bytecode . --outfile nebulosa.exe
else
compile:
	bun build --compile --minify --bytecode . --outfile nebulosa.out

serve: compile
	./nebulosa.out
endif
