.PHONY: run lint prettier test compile

run:
	bun --watch .

lint:
	bun lint

prettier:
	bun prettier

test:
	bun test --timeout 1000

compile:
	bun build --compile --minify --bytecode . --outfile nebulosa.exe
