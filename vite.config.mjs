import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { defineConfig, transformWithOxc } from 'vite'
import react from '@vitejs/plugin-react'
import autoprefixer from 'autoprefixer'

const require = createRequire(import.meta.url)
const csvLoader = require('./build/translations/loader.js').default

const ROOT = path.dirname(new URL(import.meta.url).pathname)
const FRONT_END = path.join(ROOT, 'front-end')
const SRC_DIR = path.join(FRONT_END, 'src')
const ASSETS_DIR = path.join(FRONT_END, 'assets')
const BUILD_DIR = path.join(ROOT, 'ui')

// Bare imports such as `utils/ajax`, `app`, `style.scss` or `en.csv` resolve
// against these directories, mirroring webpack's `resolve.modules`.
const MODULE_DIRS = [
  SRC_DIR,
  path.join(ASSETS_DIR, 'sass'),
  path.join(ASSETS_DIR, 'translations')
]
// Paths owned by the Go daemon; the dev server proxies them to a running reef-pi.
const BACKEND_PATHS = /^\/(api|auth|images|x)\//
const BROWSER_TARGETS = ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14']
const EXTENSIONS = ['.mjs', '.js', '.jsx']

function resolveFromModuleDirs (id) {
  for (const dir of MODULE_DIRS) {
    const base = path.join(dir, id)
    const candidates = [base, ...EXTENSIONS.map(ext => base + ext), ...EXTENSIONS.map(ext => path.join(base, 'index' + ext))]
    for (const candidate of candidates) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate
    }
  }
  return null
}

// Webpack searched node_modules first, then the app directories. The only
// name that exists in both places is `redux`; its `actions` and `store`
// sub-paths were aliased to the app.
function reefPiResolve () {
  return {
    name: 'reef-pi:resolve',
    enforce: 'pre',
    async resolveId (source, importer, options) {
      // home.html points at ../src/entry.js; in dev the browser requests it as /src/entry.js.
      if (source.startsWith('/src/')) return resolveFromModuleDirs(source.slice('/src/'.length))
      if (!importer || source.startsWith('.') || source.startsWith('/') || source.startsWith('\0') || source.includes(':')) return null
      if (/^redux\/(actions|store)(\/|$)/.test(source)) return resolveFromModuleDirs(source)
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true })
      if (resolved && !resolved.id.startsWith('__vite-browser-external')) return resolved
      return resolveFromModuleDirs(source) || resolved
    }
  }
}

// Translation CSVs are compiled to an i18next resource object at build time.
function translationsCsv () {
  return {
    name: 'reef-pi:translations-csv',
    transform (code, id) {
      if (!id.endsWith('.csv')) return null
      return { code: csvLoader(code), map: null }
    }
  }
}

// Several app modules use JSX inside `.js` files, which webpack's babel-loader
// allowed. Compile those as JSX before Vite's default transform runs.
function jsxInJs () {
  return {
    name: 'reef-pi:jsx-in-js',
    enforce: 'pre',
    async transform (code, id) {
      if (!id.startsWith(FRONT_END) || !id.endsWith('.js') || id.includes('/node_modules/')) return null
      return transformWithOxc(code, id, { lang: 'jsx', jsx: { runtime: 'automatic' } })
    }
  }
}

// The dev server serves home.html for client-side routes, like the Go daemon.
function spaFallback () {
  return {
    name: 'reef-pi:spa-fallback',
    apply: 'serve',
    configureServer (server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url.split('?')[0]
        const isNavigation = req.method === 'GET' && (req.headers.accept || '').includes('text/html')
        if (isNavigation && !path.extname(url) && !BACKEND_PATHS.test(url) && !url.startsWith('/@') && !url.startsWith('/__')) req.url = '/home.html'
        next()
      })
    }
  }
}

// The Go daemon serves ui/favicon.ico directly.
function favicon () {
  return {
    name: 'reef-pi:favicon',
    apply: 'build',
    generateBundle () {
      this.emitFile({ type: 'asset', fileName: 'favicon.ico', source: fs.readFileSync(path.join(ASSETS_DIR, 'favicon.ico')) })
    }
  }
}

export default defineConfig(({ mode }) => ({
  root: ASSETS_DIR,
  base: '/',
  publicDir: false,
  plugins: [reefPiResolve(), jsxInJs(), translationsCsv(), react({ include: /\.(js|jsx)$/ }), spaFallback(), favicon()],
  css: {
    postcss: { plugins: [autoprefixer()] },
    preprocessorOptions: {
      scss: { loadPaths: [path.join(ASSETS_DIR, 'sass')] }
    }
  },
  optimizeDeps: {
    // App sources use JSX inside .js files; let the dev dependency scanner parse them.
    rolldownOptions: { moduleTypes: { '.js': 'jsx' } }
  },
  server: {
    fs: { allow: [ROOT] },
    proxy: {
      [BACKEND_PATHS.source]: { target: process.env.REEF_PI_URL || 'http://127.0.0.1:8080', changeOrigin: true, ws: true }
    }
  },
  build: {
    outDir: BUILD_DIR,
    emptyOutDir: true,
    assetsDir: 'assets',
    assetsInlineLimit: 0,
    // Keep support for the older tablets and browsers reef-pi is often viewed on;
    // this also stops CSS media queries being rewritten to range syntax.
    target: BROWSER_TARGETS,
    cssTarget: BROWSER_TARGETS,
    sourcemap: mode === 'development' ? 'inline' : false,
    minify: mode !== 'development',
    chunkSizeWarningLimit: 2048,
    rolldownOptions: {
      input: path.join(ASSETS_DIR, 'home.html'),
      output: {
        entryFileNames: 'assets/js/[name].[hash].js',
        chunkFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: (asset) => {
          const name = asset.names?.[0] || asset.name || ''
          if (name.endsWith('.css')) return 'assets/css/[name].[hash][extname]'
          if (/\.(woff2?|ttf|otf|eot)$/.test(name)) return 'assets/fonts/[name].[hash][extname]'
          return 'assets/[name].[hash][extname]'
        },
        manualChunks (id) {
          if (id.includes('/node_modules/')) return 'vendor'
        }
      }
    }
  }
}))
