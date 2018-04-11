import fs from 'fs'
import { rollup } from 'rollup'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'
import pkg from './package.json'

const bundles = [
  {
    format: 'cjs',
    input: 'src/common.js',
    ext: '.js',
    plugins: [replace({ 'process.env.ES_MODULES': true })],
    babelPresets: ['@babel/preset-stage-1'],
    babelPlugins: [
      '@babel/plugin-transform-destructuring',
      '@babel/plugin-transform-function-name',
      '@babel/plugin-transform-parameters',
      '@babel/plugin-proposal-object-rest-spread'
    ]
  },
  {
    format: 'es',
    ext: '.mjs',
    plugins: [],
    babelPresets: ['@babel/preset-stage-1'],
    babelPlugins: [
      '@babel/plugin-transform-destructuring',
      '@babel/plugin-transform-function-name',
      '@babel/plugin-transform-parameters',
      '@babel/plugin-proposal-object-rest-spread'
    ]
  },
  {
    format: 'cjs',
    input: 'src/common.js',
    ext: '.browser.js',
    plugins: [],
    babelPresets: [['@babel/preset-env', { 'modules': false }], '@babel/preset-stage-1'],
    babelPlugins: ['@babel/plugin-proposal-object-rest-spread']
  },
  {
    format: 'umd',
    input: 'src/common.js',
    ext: '.js',
    plugins: [],
    babelPresets: [['@babel/preset-env', { 'modules': false }], '@babel/preset-stage-1'],
    babelPlugins: ['@babel/plugin-proposal-object-rest-spread'],
    moduleName: 'xt'
  },
  {
    format: 'umd',
    input: 'src/common.js',
    ext: '.min.js',
    plugins: [uglify()],
    babelPresets: [['@babel/preset-env', { 'modules': false }], '@babel/preset-stage-1'],
    babelPlugins: ['@babel/plugin-proposal-object-rest-spread'],
    moduleName: 'xt',
    minify: true
  }
]

let promise = Promise.resolve()

// Compile source code into a distributable format with Babel and Rollup
for (const config of bundles) {
  const output = {
    file: `dist/${config.moduleName || 'index'}${config.ext}`,
    format: config.format,
    name: config.moduleName,
    sourcemap: true
  }

  promise = promise.then(
    () => rollup({
      input: config.input || 'src/index.js',
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
          plugins: config.babelPlugins
        })
      ]
        .concat(config.plugins)
    })
      .then(bundle => bundle.generate(output).then(() => bundle.write(output)))
  )
}

// Copy package.json and LICENSE
promise = promise.then(() => {
  delete pkg.private
  delete pkg.devDependencies
  delete pkg.scripts
  delete pkg.eslintConfig
  delete pkg.babel
  fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf-8')
  fs.writeFileSync('dist/LICENSE', fs.readFileSync('LICENSE', 'utf-8'), 'utf-8')
})
