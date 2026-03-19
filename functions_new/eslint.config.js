const globals = require("globals");

module.exports = [
  {
    languageOptions: {
      globals: {
        ...globals.es6,
        ...globals.node,
      },
      ecmaVersion: 2021,
      sourceType: "commonjs",
    },
    plugins: {
      prettier: require("eslint-plugin-prettier"),
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-async-promise-executor": "off",
      "consistent-return": "off",
      "no-redeclare": "off",
      "prettier/prettier": "error",
    },
  },
];
