import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import htmlPurge from 'vite-plugin-purgecss'
import { env, cwd } from '../common.js'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // htmlPurge(),
    react()
  ],
  publicDir: false,
  css: {
    codeSplit: false
  },
  build: {
    cssCodeSplit: false,
    outDir: resolve(cwd, env.OUT),
    rollupOptions: {
      input: {
        [env.ENTRY_NAME]: resolve(cwd, env.ENTRY)
      },
      external: [
        'react',
        'react-dom',
        'canvas-shapes-bg',
        'universe-bg',
        'three'
      ],
      output: {
        format: 'umd',
        entryFileNames: `${env.ENTRY_NAME}.bundle.js`,
        chunkFileNames: '[name].[hash].bundle.js',
        assetFileNames: `${env.ENTRY_NAME}.bundle[extname]`,
        dir: resolve(cwd, env.OUT),
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'canvas-shapes-bg': 'CanvasShapesBg',
          three: 'THREE'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(cwd, './src')
    }
  }
})
