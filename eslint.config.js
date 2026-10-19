// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier');

/** Regla de capas: qué alias NO puede importar cada carpeta. */
const layer = (files, forbidden, message) => ({
  files,
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ group: forbidden, message }] }],
  },
});

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
      prettier,
    ],
    processor: angular.processInlineTemplates,
    // Lint con información de tipos: lo necesitan reglas como no-uncalled-signals.
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      // Angular moderno: signals, inject() y @Service() en lugar de los patrones legacy.
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-service-decorator': 'error',
      '@angular-eslint/prefer-output-readonly': 'error',
      '@angular-eslint/no-uncalled-signals': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/button-has-type': 'error',
      '@angular-eslint/template/no-inline-styles': 'error',
    },
  },
  layer(
    ['src/app/shared/**/*.ts'],
    ['@core/*', '@layout/*', '@domain/*', '@features/*'],
    'shared es UI genérica: no puede depender de ninguna otra capa del proyecto.',
  ),
  layer(
    ['src/app/core/**/*.ts'],
    ['@layout/*', '@domain/*', '@features/*'],
    'core solo puede depender de shared.',
  ),
  layer(
    ['src/app/layout/**/*.ts'],
    ['@domain/*', '@features/*'],
    'layout solo puede depender de core y shared.',
  ),
  layer(
    ['src/app/domain/**/*.ts'],
    ['@layout/*', '@shared/*', '@features/*'],
    'domain solo puede depender de core.',
  ),
  layer(
    ['src/app/features/**/*.ts'],
    ['@features/*', '@layout/*'],
    'Una feature no importa de otra feature ni del layout. Lo compartido sube a domain o shared.',
  ),
]);
