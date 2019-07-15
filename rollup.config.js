import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json'

const external = Object.keys(pkg.peerDependencies || {});
const allExternal = [...external, Object.keys(pkg.dependencies || {})];

export default {
  input: 'src/index.js',
  external: allExternal,
  plugins: [
    commonjs({
      include: [
        'node_modules/**',
      ],
    }),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
  output: {
    file: pkg.main,
    format: 'cjs',
    exports: 'named',
  }
};
