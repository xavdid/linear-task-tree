output := "linear-epic"

@run:
	# bun run .
	node lib/index.js

@build:
	# bun build --compile ./index.ts --outfile {{output}}
	yarn tsc

@dev:
	yarn tsc --watch

@clean:
	rm -f .*bun-build {{output}} *.js *.d.ts *.tsbuildinfo
