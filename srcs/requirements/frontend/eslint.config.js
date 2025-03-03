import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginVue from 'eslint-plugin-vue';

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    ignores: ['node_modules', 'dist'],
    plugins: {
      import: pluginImport,
      vue: pluginVue,
      prettier: pluginPrettier,
      'simple-import-sort': pluginSimpleImportSort,
    },
    rules: {
      'vue/no-unused-vars': 'error',
      'vue/no-mutating-props': 'error',
      'vue/multi-word-component-names': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'comma-dangle': ['error', 'only-multiline'],
      camelcase: 'warn',
      'vue/attributes-order': [
        'error',
        {
          order: [
            'DEFINITION',
            'LIST_RENDERING',
            'CONDITIONALS',
            'RENDER_MODIFIERS',
            'GLOBAL',
            'UNIQUE',
            'TWO_WAY_BINDING',
            'OTHER_ATTR',
            'EVENTS',
            'CONTENT',
          ],
          alphabetical: false,
        },
      ],
      'vue/order-in-components': [
        'error',
        {
          order: [
            'el',
            'name',
            'parent',
            'functional',
            ['components', 'directives', 'filters'],
            ['extends', 'mixins'],
            'inheritAttrs',
            'model',
            ['props', 'propsData'],
            'data',
            'computed',
            'methods',
            'watch',
            'LIFECYCLE_HOOKS',
            'template',
            'render',
            'renderError',
          ],
        },
      ],
    },
  },
  prettierConfig,
];
