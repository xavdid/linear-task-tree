module.exports = {
  root: true,
  // don't lint this file
  // https://typescript-eslint.io/linting/troubleshooting#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file
  ignorePatterns: [".eslintrc.cjs", "*.js", "*.d.ts"],
  extends: "@xavdid",
  parserOptions: {
    project: `${__dirname}/tsconfig.json`,
  },
};
