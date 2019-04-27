const commonjs = require('rollup-plugin-commonjs');
const fs = require('fs');
const path = require('path');
const resolve = require('rollup-plugin-node-resolve');
const { rollup } = require('rollup');

const plugins = [commonjs(), resolve({ preferBuiltins: true })];
const bufferPolyfill = fs.readFileSync(
  path.resolve(__dirname, '../src/browser-buffer-polyfill.js'),
  'utf8'
);
const tasks = [
  [
    { input: 'src/index.js', plugins },
    {
      file: 'index.js',
      format: 'cjs'
    }
  ],
  [
    { input: 'src/index.js', plugins },
    {
      file: 'index.mjs',
      format: 'esm'
    }
  ],
  [
    { input: 'src/browser.js', plugins },
    {
      intro: bufferPolyfill,
      file: 'browser/index.js',
      format: 'esm'
    }
  ],
  ...configDirectives(),
  ...configDirectives('browser')
];

(async function() {
  for (const [inputOptions, outputOptions, preWrite] of tasks) {
    const bundle = await rollup(inputOptions);
    const { output } = await bundle.generate(outputOptions);

    for (const chunkOrAsset of output) {
      let content = chunkOrAsset.isAsset ? chunkOrAsset.source : chunkOrAsset.code;

      if (preWrite) {
        content = preWrite(content);
      }
      write(path.resolve(outputOptions.file), content);
    }
  }
})();

function configDirectives(outputdir = '') {
  const config = [];
  const dir = path.resolve('src/directives');
  const directives = fs.readdirSync(dir);
  const indexpath = path.resolve('src/index.js');

  for (const directive of directives) {
    if (path.extname(directive) === '.js') {
      const input = path.join(dir, directive);
      const filename = path.join(outputdir, 'directives', directive);
      config.push([
        {
          external: [indexpath],
          input,
          plugins
        },
        {
          file: filename,
          format: 'esm'
        }
      ]);
    }
  }

  return config;
}

function write(filepath, content) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, content);
}
