import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  external: [
    'minimist',
    'chalk',
    'fs-extra',
    'shelljs',
    'jimp',
    'qrcode',
    'jsqr',
    'node:path',
    'node:process',
    'node:os',
    'node:crypto',
    'glob'
  ]
}); 