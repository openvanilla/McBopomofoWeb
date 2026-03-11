const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
  {
    ignores: [
      "dist/**",
      "output/**",
      "coverage/**",
      "node_modules/**",
      "*.js",
      "!eslint.config.js",
      "!jest.config.js",
      "!webpack.config.*.js",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },

    plugins: {
      "@typescript-eslint": tseslint,
      "simple-import-sort": require("eslint-plugin-simple-import-sort"),
    },

    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      eqeqeq: [
        "warn",
        "always",
        {
          null: "ignore",
        },
      ],

      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "class",
          format: ["PascalCase"],
        },
      ],
    },
  },
];
