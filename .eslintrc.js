module.exports = {
    parser: 'typescript-eslint-parser',
    plugins: [
        'typescript'
    ],
    rules: {
        'eqeqeq': [
            'error',
            'always',
            {
                null: 'ignore'
            }
        ],
        'typescript/class-name-casing': 'error',
        'prefer-const': 'error'
    }
}
