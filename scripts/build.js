// @ts-nocheck

const commonjs = require('rollup-plugin-commonjs');
const fs = require('fs');
const path = require('path');
const resolve = require('rollup-plugin-node-resolve');
const { rollup } = require('rollup');

if (!fs.existsSync(path.resolve('directives'))) {
  fs.mkdirSync(path.resolve('directives'));
}

const plugins = [commonjs(), resolve({ preferBuiltins: true })];
const bufferPolyfill = fs.readFileSync(
  path.resolve(__dirname, '../src/browser-buffer-polyfill.js'),
  'utf8'
);
const tasks = [
  [
    { external: ['stream'], input: 'src/index.js', plugins },
    {
      file: 'index.js',
      format: 'cjs'
    }
  ],
  [
    { external: ['stream'], input: 'src/index.js', plugins },
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
  ...configDirectives('', 'cjs', '.js', true),
  ...configDirectives('', 'esm', '.mjs'),
  ...configDirectives('browser', 'esm', '.js')
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
  write(
    path.resolve('index.d.ts'),
    fs.readFileSync(path.resolve('src/types.d.ts'), 'utf8').replace(/\/\* export \*\//g, 'export')
  );
})();

function configDirectives(outputdir = '', format, extension, moveTypes) {
  const config = [];
  const dir = path.resolve('src/directives');
  const directives = fs.readdirSync(dir);
  const preWrite = (content) => content.replace('../index.js', '../index.mjs');

  for (const directive of directives) {
    const input = path.join(dir, directive);
    let filename = path.join(outputdir, 'directives', directive);

    if (path.extname(directive) === '.js') {
      if (extension === '.mjs') {
        filename = filename.replace('.js', '.mjs');
      }

      config.push([
        {
          external: (id) => id === '../index.js',
          input,
          plugins
        },
        {
          file: filename,
          format
        },
        extension === '.mjs' ? preWrite : undefined
      ]);
    } else if (path.extname(directive) === '.ts' && moveTypes) {
      fs.copyFileSync(input, path.resolve(filename));
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
