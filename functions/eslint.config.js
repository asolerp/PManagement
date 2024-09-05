const globals = require('globals');

module.exports = [
  {
    languageOptions: {
      globals: {
        ...globals.es6,
        ...globals.node
        // Añade aquí otros globales necesarios, como los de React Native
      },
      ecmaVersion: 2021, // Define la versión de ECMAScript que quieres utilizar
      sourceType: 'module' // Asegura que ESLint entienda que estás usando módulos ES6
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    plugins: {
      prettier: require('eslint-plugin-prettier'),
      'react-native': require('eslint-plugin-react-native'),
      'simple-import-sort': require('eslint-plugin-simple-import-sort'),
      immutable: require('eslint-plugin-immutable')
    },
    rules: {
      // Reglas de ESLint recomendadas
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      // Otras reglas personalizadas
      'react/display-name': 'off',
      'no-async-promise-executor': 'off',
      'consistent-return': 'off',
      'no-redeclare': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'off',
      'react-native/no-raw-text': 'off',
      'react-native/no-inline-styles': 'off',
      'react/prop-types': 'off',
      'jest/no-mocks-import': 'off',
      'prettier/prettier': 'error' // Para asegurar que Prettier maneja la formateación
    }
  }
];
