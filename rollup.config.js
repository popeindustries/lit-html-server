const commonjs = require('rollup-plugin-commonjs');
const fs = require('fs');
const path = require('path');
const resolve = require('rollup-plugin-node-resolve');

const plugins = [commonjs(), resolve({ preferBuiltins: true })];

module.exports = [
  ...configDirectives(),
  {
    external: ['stream', 'fs'],
    input: 'src/index.js',
    plugins,
    output: {
      exports: 'named',
      file: 'index.js',
      format: 'cjs'
    }
  }
];

function configDirectives() {
  const dir = path.resolve('src/directives');
  const directives = fs.readdirSync(dir);
  const config = [];

  for (const directive of directives) {
    if (path.extname(directive) === '.js') {
      config.push({
        external: [path.resolve('src/index.js')],
        input: path.join(dir, directive),
        plugins,
        output: {
          file: path.join('directives', directive),
          format: 'cjs'
        }
      });
    }
  }

  return config;
}
