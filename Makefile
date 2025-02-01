.PHONY: run lint format test compile

run:
	bun --watch .

lint:
	bun lint

format:
	bun format

test:
	bun test --timeout 1000

compile:
	bun build --compile --minify --bytecode . --outfile nebulosa.exe
