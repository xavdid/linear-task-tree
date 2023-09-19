output := "linear-epic"

@run:
	bun run .

@build:
	bun build --compile ./index.ts --outfile {{output}}

@clean:
	rm -f .*bun-build {{output}}
