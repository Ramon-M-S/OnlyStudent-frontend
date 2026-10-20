import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/api': {
          target: env.BACKEND_URL || 'http://localhost:8082',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
          configure: proxy => proxy.on('proxyReq', request => request.removeHeader('origin'))
        }
      }
    },
    test: { environment: 'jsdom', exclude: ['e2e/**', 'node_modules/**'] }
  }
})
