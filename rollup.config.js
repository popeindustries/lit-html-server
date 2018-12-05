const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');

module.exports = [
  {
    input: 'lib/browser.js',
    plugins: [commonjs(), resolve({ browser: true })],
    output: {
      exports: 'named',
      file: 'browser.js',
      format: 'umd',
      name: 'litHtmlServer'
    }
  },
  {
    external: ['readable-stream', 'stream', 'fs'],
    input: 'lib/index.js',
    plugins: [commonjs(), resolve()],
    output: {
      exports: 'named',
      file: 'index.js',
      format: 'cjs'
    }
  }
];
