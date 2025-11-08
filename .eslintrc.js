module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
    },
    plugins: [
        '@typescript-eslint'
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier'
    ],
    rules: {
        'eqeqeq': [
            'error',
            'always',
            {
                null: 'ignore'
            }
        ],
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'class',
                format: ['PascalCase']
            }
        ],
        'prefer-const': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off'
    },
    env: {
        node: true,
        es2022: true,
        browser: true
    }
}
