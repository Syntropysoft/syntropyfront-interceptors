import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    }
  ],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs()
  ],
  external: ['@syntropysoft/syntropyfront'],
  onwarn(warning, warn) {
    // Ignore circular dependency warnings
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      return;
    }
    warn(warning);
  }
}); 