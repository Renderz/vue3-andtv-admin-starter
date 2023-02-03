module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  // https://eslint.vuejs.org/user-guide/#usage
  // you have to use the parserOptions.parser option instead of the parser option.
  // Because this plugin requires vue-eslint-parser (opens new window)to parse .vue files,
  // this plugin doesn't work if you overwrite the parser option.
  parser: 'vue-eslint-parser',
  parserOptions: {
    // use @typescript-eslint/parser instead of @babel/eslint-parser when using typescript
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    // https://eslint.vuejs.org/user-guide/#using-jsx
    // enable JSX
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    // https://github.com/prettier/eslint-config-prettier/blob/main/CHANGELOG.md#version-800-2021-02-21
    // diabled conflict rules
    // 'prettier/@typescript-eslint',
    // https://eslint.vuejs.org/user-guide/#conflict-with-prettier
    // Use eslint-config-prettier (opens new window)for Prettier (opens new window)not to conflict with the shareable config provided by this plugin.
    // Make sure "prettier" is the last element in this list.
    // 'prettier',
    // https://github.com/prettier/eslint-plugin-prettier#recommended-configuration
    // use plugin:prettier/recommended instead of eslint-config-prettier
    'plugin:prettier/recommended',
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
};
