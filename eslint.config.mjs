import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

const eslintConfig = [
  ...compat.config({
    extends: ['eslint:recommended', 'next', 'next/typescript', 'prettier'],
    ignorePatterns: ['*.js'],
    rules: {
      '@next/next/no-img-element': 'off',
    },
  }),
]

export default eslintConfig
