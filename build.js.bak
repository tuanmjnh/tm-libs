const { build } = require("esbuild");
const { dependencies } = require('./package.json');
const { Generator } = require('npm-dts');
new Generator({
  entry: 'index.ts',
  output: 'dist/index.d.ts'
}).generate();
const sharedConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  external: Object.keys(dependencies),
};
build({
  ...sharedConfig,
  platform: 'node', // for CJS
  outfile: "dist/index.js",
});
build({
  ...sharedConfig,
  outfile: "dist/index.esm.js",
  platform: 'neutral', // for ESM
  format: "esm",
});

//fs-lib - node
new Generator({
  entry: 'fs-lib.ts',
  output: 'dist/fs-lib.d.ts'
}).generate();
build({
  ...sharedConfig,
  platform: 'node', // for CJS
  outfile: "dist/fs-lib.js",
});