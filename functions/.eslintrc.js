module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
    "indent": ["error", 2],
    "linebreak-style": ["error", "windows"],
    "eol-last": ["error", "always"],
    "no-unused-vars": ["warn", {"argsIgnorePattern": "^_"}],
    "require-jsdoc": "off",
    "max-len": ["error", {"code": 120}],
  },
  overrides: [
    {
      files: ["**/*.spec.js"],
      env: {
        mocha: true,
      },
      rules: {
        "no-unused-expressions": "off",
      },
    },
  ],
};
