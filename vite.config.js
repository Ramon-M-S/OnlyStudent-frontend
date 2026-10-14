import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [vue()],
  server: { proxy: { '/api': {
    target: 'http://localhost:8082',
    changeOrigin: true,
    rewrite: path => path.replace(/^\/api/, ''),
    configure: proxy => proxy.on('proxyReq', proxyRequest => proxyRequest.removeHeader('origin'))
  } } },
  test: { environment: 'jsdom', exclude: ['e2e/**', 'node_modules/**'] }
})
