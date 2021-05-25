// @ts-nocheck

import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const IMPORT_MAP = {
  './node-stream-template-renderer.js': './src/browser-stream-template-renderer.js',
  buffer: './src/browser-buffer.js',
  stream: './src/browser-stream.js',
};

(async function main() {
  await esbuild.build({
    bundle: true,
    entryPoints: ['./src/shared.js'],
    format: 'esm',
    target: 'es2020',
    platform: 'browser',
    outfile: 'shared.js',
  });

  await esbuild.build({
    bundle: true,
    entryPoints: ['./src/index.js'],
    external: ['*/shared.js'],
    format: 'esm',
    target: 'node13.2',
    platform: 'node',
    outfile: 'index.js',
  });

  await esbuild.build({
    bundle: true,
    entryPoints: ['./src/index.js'],
    external: ['*/shared.js'],
    format: 'esm',
    target: 'es2020',
    platform: 'browser',
    outfile: 'browser.js',
    plugins: [
      {
        name: 'browser-rewrite-import',
        setup(build) {
          build.onResolve({ filter: /.*/ }, function (args) {
            if (args.path in IMPORT_MAP) {
              return { path: path.resolve(IMPORT_MAP[args.path]) };
            }
          });
        },
      },
    ],
  });
})();

fs.copyFileSync(path.resolve('src/index.d.ts'), path.resolve('index.d.ts'));

if (!fs.existsSync(path.resolve('directives'))) {
  fs.mkdirSync(path.resolve('directives'));
}

for (const basePath of fs.readdirSync(path.resolve('src/directives'))) {
  fs.copyFileSync(path.resolve('src/directives', basePath), path.resolve('directives', basePath));
}
