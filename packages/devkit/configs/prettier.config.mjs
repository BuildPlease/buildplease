import ejsPlugin from 'prettier-plugin-ejs';
import packageJsonPlugin from 'prettier-plugin-packagejson';
import * as tailwindPlugin from 'prettier-plugin-tailwindcss';

export default {
  semi: true,
  printWidth: 120,
  tabWidth: 2,
  singleQuote: true,
  singleAttributePerLine: true,
  trailingComma: 'all',
  arrowParens: 'always',
  vueIndentScriptAndStyle: false,
  plugins: [ejsPlugin, packageJsonPlugin, tailwindPlugin],
};
