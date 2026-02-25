import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { readFileSync } from 'fs'

// Read API endpoint for local dev proxy (from sandbox deploy)
function getApiTarget(): string {
  try {
    const outputs = JSON.parse(readFileSync('./amplify_outputs.json', 'utf8'))
    const url = outputs?.custom?.API?.ToolstoyApi?.endpoint
    return url ? String(url).replace(/\/$/, '') : 'http://localhost:20002'
  } catch {
    return 'http://localhost:20002'
  }
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: getApiTarget(),
        changeOrigin: true,
      },
    },
  },
})
