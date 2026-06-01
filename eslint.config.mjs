// Minimal ESLint flat config — used only for Bootstrap Tier-1 ban (lint:no-bootstrap)
// StandardJS (js-lint) remains the primary linter for style; this enforces migration guardrails.
export default [
  { ignores: ['**/*.test.js', '**/__snapshots__/**'] },
  {
    files: ['front-end/src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/\\b(container-fluid|container|col-|d-flex|justify-content-|align-items-|align-self-|[mp][tblrxy]?-[0-5]|text-(center|left|right))\\b/]",
          message: 'Bootstrap Tier-1 utility class banned — use tokens + plain flex/grid. See E6 #27.'
        }
      ]
    }
  }
]
