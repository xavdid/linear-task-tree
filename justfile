# run installed node_modules without prefix
export PATH := "./node_modules/.bin:" + env_var('PATH')

output := "linear-task-tree"
symlink := env_var("HOME") / "bin" / output

@_default:
    just --list

# run the dev version of the program
[no-exit-message]
@run *options:
    bun run src/index.ts {{ options }}

# compile for release and move to a directory
@build dest="~/bin/":
  bun build --compile src/index.ts --outfile {{output}}
  mv {{output}} {{dest}}

# remove build outputs and side effects
@clean:
    rm -rf .*bun-build *.js *.d.ts *.tsbuildinfo lib

@lint:
    tsc
    eslint src

# install dependencies loocally
@install:
    bun install
