import fs from 'fs'
import { rollup } from 'rollup'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'
import pkg from './package.json'

const bundles = [
  {
    format: 'cjs', ext: '.js', plugins: [],
    babelPresets: ['@babel/preset-stage-1'], babelPlugins: [
      'transform-es2015-destructuring',
      'transform-es2015-function-name',
      'transform-es2015-parameters'
    ]
  },
  {
    format: 'es', ext: '.mjs', plugins: [],
    babelPresets: ['@babel/preset-stage-1'], babelPlugins: [
      'transform-es2015-destructuring',
      'transform-es2015-function-name',
      'transform-es2015-parameters'
    ]
  },
  {
    format: 'cjs', ext: '.browser.js', plugins: [],
    babelPresets: [["@babel/preset-env", { "modules": false }], '@babel/preset-stage-1'], babelPlugins: []
  },
  {
    format: 'umd', ext: '.js', plugins: [],
    babelPresets: [["@babel/preset-env", { "modules": false }], '@babel/preset-stage-1'], babelPlugins: [],
    moduleName: 'xt'
  },
  {
    format: 'umd', ext: '.min.js', plugins: [uglify()],
    babelPresets: [["@babel/preset-env", { "modules": false }], '@babel/preset-stage-1'], babelPlugins: [],
    moduleName: 'xt', minify: true
  }
];

let promise = Promise.resolve();

// Compile source code into a distributable format with Babel and Rollup
for (const config of bundles) {
  const output = {
    file: `dist/${config.moduleName || 'index'}${config.ext}`,
    format: config.format,
    name: config.moduleName,
    sourcemap: !config.minify
  };

  promise = promise.then(
    () => rollup({
      input: 'src/index.js',
      plugins: [
        resolve({
          browser: true,
          jsnext: true
        }),
        commonjs(),
        babel({
          babelrc: false,
          exclude: 'node_modules/**',
          presets: config.babelPresets,
          plugins: config.babelPlugins,
        })
      ].concat(config.plugins),
    })
      .then(bundle => bundle.generate(output).then(() => bundle.write(output)))
  )
}

// Copy package.json and LICENSE
promise = promise.then(() => {
  delete pkg.private;
  delete pkg.devDependencies;
  delete pkg.scripts;
  delete pkg.eslintConfig;
  delete pkg.babel;
  fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf-8');
  fs.writeFileSync('dist/LICENSE', fs.readFileSync('LICENSE', 'utf-8'), 'utf-8');
});
