import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import url from 'rollup-plugin-url'
import copy from 'rollup-plugin-cpy';

import pkg from './package.json'

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true
    }
  ],
  plugins: [
    external(),
    url(),
    resolve(),
    babel({
      exclude: 'node_modules/**',
      plugins: [ 'external-helpers' ]
    }),
    commonjs(),
    copy([
      // The example uses create-react-app (via create-react-library), which
      // doesn't work correctly with yarn or npm links. It will end up with
      // two versions of React in the build, which breaks hooks in particular
      // since they rely on global state. To avoid this problem we simply copy
      // the source directly into the example project.
      //
      // For more info about the issue:
      // https://stackoverflow.com/questions/31169760/how-to-avoid-react-loading-twice-with-webpack-when-developing
      {
        files: ['dist/index.es.js'],
        dest: 'example/src/react-use-database/',
      },
    ]),
  ]
}
