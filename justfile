output := "linear-epic"

@_default:
    just --list

# run the dev version of the program
@run:
    # bun run src/index.ts
    node lib/index.js

# run the Advent of Code generation script for this year
@aoc:
    # bun run src/aoc.ts
    node lib/aoc.js

# create a build artifact - either a single binary or the `lib` directory
@build:
    # bun build --compile ./index.ts --outfile {{ output }}
    yarn tsc

# run the dev watch server. Only required when using node directly
@dev:
    yarn tsc --watch

# remove build outputs and side effects
@clean:
    rm -f .*bun-build {{ output }} *.js *.d.ts *.tsbuildinfo lib

@lint:
    yarn eslint src

# install dependencies
@install:
    # bun install
    yarn install
