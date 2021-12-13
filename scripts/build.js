// @ts-nocheck

const commonjs = require('@rollup/plugin-commonjs');
const fs = require('fs');
const path = require('path');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { rollup } = require('rollup');

if (!fs.existsSync(path.resolve('directives'))) {
  fs.mkdirSync(path.resolve('directives'));
}

const plugins = [
  commonjs(),
  nodeResolve({
    exportConditions: ['browser', 'import', 'require', 'default'],
    preferBuiltins: true,
  }),
];
const input = {
  external: (id) => id === '#buffer' || id === '#stream' || path.basename(id) === 'shared.js',
  input: 'src/index.js',
  plugins,
};
const tasks = [
  [
    input,
    {
      file: 'index.js',
      format: 'cjs',
    },
    (content) => content.replace(/(#)(buffer|stream)/g, '$2'),
  ],
  [
    input,
    {
      file: 'index.mjs',
      format: 'esm',
    },
    (content) =>
      content.replace(/\.\/shared\.js/g, './shared.mjs').replace(/(#)(buffer|stream)/g, '$2'),
  ],
  [
    {
      external: (id) => path.basename(id) === 'shared.js',
      input: 'src/index.js',
      plugins: [
        commonjs(),
        nodeResolve({ exportConditions: ['browser', 'import', 'require', 'default'] }),
      ],
    },
    {
      file: 'browser.mjs',
      format: 'esm',
    },
    (content) => content.replace(/\.\/shared\.js/g, './shared.mjs'),
  ],
  [
    {
      input: 'src/shared.js',
      plugins,
    },
    {
      file: 'shared.mjs',
      format: 'esm',
    },
  ],
  [
    {
      input: 'src/shared.js',
      plugins,
    },
    {
      file: 'shared.js',
      format: 'cjs',
    },
  ],
  ...configDirectives('cjs', '.js', true),
  ...configDirectives('esm', '.mjs'),
];

(async function () {
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

function configDirectives(format, extension, moveTypes) {
  const config = [];
  const dir = path.resolve('src/directives');
  const directives = fs.readdirSync(dir);
  const preWrite = (content) => content.replace('../shared.js', '../shared.mjs');

  for (const directive of directives) {
    const input = path.join(dir, directive);
    let filename = path.join('directives', directive);

    if (path.extname(directive) === '.js') {
      if (extension === '.mjs') {
        filename = filename.replace('.js', '.mjs');
      }

      config.push([
        {
          external: (id) => id !== input,
          input,
          plugins,
        },
        {
          file: filename,
          format,
        },
        extension === '.mjs' ? preWrite : undefined,
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
