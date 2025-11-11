const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
    {
        ignores: ["dist/**", "output/**", "coverage/**", "node_modules/**", "*.js", "!eslint.config.js", "!jest.config.js", "!webpack.config.*.js"],
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
        },

        plugins: {
            "@typescript-eslint": tseslint,
        },

        rules: {
            "eqeqeq": ["warn", "always", {
                null: "ignore",
            }],

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
