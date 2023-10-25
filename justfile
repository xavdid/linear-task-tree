# run installed node_modules without prefix
export PATH := "./node_modules/.bin:" + env_var('PATH')

output := "linear-task-tree"
symlink := env_var("HOME") / "bin" / output

@_default:
    just --list

# run the dev version of the program
@run:
    bun run src/index.ts

# run the Advent of Code generation script for this calendar year
@aoc:
    bun run src/aoc.ts

# create a build artifact
@build: lint
    bun build --compile src/index.ts --outfile {{ output }}

# create a symlink to the ~/bin if it doesn't exist
link:
    #!/usr/bin/env sh
    if {{ if path_exists(symlink) != "true" { "true" } else { "false" } }}; then
        just build
        ln -s "$(pwd)/{{ output }}" ~/bin
    else
        echo "already exists"
    fi

# remove build outputs and side effects
@clean:
    rm -rf .*bun-build *.js *.d.ts *.tsbuildinfo lib

@lint:
    tsc
    eslint src

# install dependencies loocally
@install:
    bun install
